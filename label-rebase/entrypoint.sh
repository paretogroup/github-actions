#!/bin/bash

set -e

if [[ -z "$GITHUB_TOKEN" ]]; then
	echo "Set the GITHUB_TOKEN env variable."
	exit 1
fi

EVENT=$GITHUB_EVENT_PATH
URI=https://api.github.com
API_HEADER="Accept: application/vnd.github.v3+json"
AUTH_HEADER="Authorization: token $GITHUB_TOKEN"

set_commit_info() {
	USER_LOGIN=$1
	HEAD_REPO=$2	
	COMMITTER_TOKEN=$GITHUB_TOKEN

	user_resp=$(curl -X GET -s -H "${AUTH_HEADER}" -H "${API_HEADER}" \
            "${URI}/users/${USER_LOGIN}")

	USER_NAME=$(echo "$user_resp" | jq -r ".name")
	if [[ "$USER_NAME" == "null" ]]; then
		USER_NAME=$USER_LOGIN
	fi

	USER_NAME="${USER_NAME} (Rebase PR Action)"

	USER_EMAIL=$(echo "$user_resp" | jq -r ".email")
	if [[ "$USER_EMAIL" == "null" ]]; then
		USER_EMAIL="$USER_LOGIN@users.noreply.github.com"
	fi	

	git remote set-url origin https://x-access-token:$COMMITTER_TOKEN@github.com/$GITHUB_REPOSITORY.git
	git config --global user.email "$USER_EMAIL"
	git config --global user.name "$USER_NAME"

	git remote add fork https://x-access-token:$COMMITTER_TOKEN@github.com/$HEAD_REPO.git
}

remove_label() {
	PR_NUMBER=$1

	label_remove_resp=$(curl -X DELETE -s -H "${AUTH_HEADER}" -H "${API_HEADER}" \
            "${URI}/repos/${GITHUB_REPOSITORY}/issues/${PR_NUMBER}/labels/rebase")
}

pr_resp=$(jq -r ".pull_request" "$EVENT")

if [[ "$(echo "$pr_resp" | jq -r .rebaseable)" != "true" ]]; then
	echo "GitHub doesn't think that the PR is rebaseable!"
	exit 1
fi

USER_LOGIN=$(jq -r ".sender.login" "$EVENT")
PR_NUMBER=$(echo "$pr_resp" | jq -r .number)
BASE_BRANCH=$(echo "$pr_resp" | jq -r .base.ref)
BASE_REPO=$(echo "$pr_resp" | jq -r .base.repo.full_name)
HEAD_REPO=$(echo "$pr_resp" | jq -r .head.repo.full_name)
HEAD_BRANCH=$(echo "$pr_resp" | jq -r .head.ref)

if [[ -z "$BASE_BRANCH" ]]; then
	echo "Cannot get base branch information for PR #$PR_NUMBER!"
	echo "API response: $pr_resp"
	exit 1
fi

echo "Collecting information about PR #$PR_NUMBER of $GITHUB_REPOSITORY..."
echo "Base branch for PR #$PR_NUMBER is $BASE_BRANCH"

set_commit_info $USER_LOGIN $HEAD_REPO

set -o xtrace

git fetch origin $BASE_BRANCH
git fetch fork $HEAD_BRANCH

# do the rebase
git checkout -b $HEAD_BRANCH fork/$HEAD_BRANCH
git rebase origin/$BASE_BRANCH

# push back
git push --force-with-lease fork $HEAD_BRANCH

remove_label $PR_NUMBER
