const core = require('@actions/core');
const github = require('@actions/github');

async function removeAllColumnLabels(client, owner, repo, issue_number) {

    const allColumnLabels = (
        await client.issues.listLabelsForRepo({ owner, repo })
    ).data;

    return Promise.all(
        allColumnLabels.map((label) => {
            client.issues.removeLabel({
                owner,
                repo,
                issue_number,
                name: label.name
            });
        })
    )
}

async function run() {
    try {
        const token = core.getInput('token', { required: true });
        const issueId = core.getInput('issue_id',  { required: true });
        const organizationName = core.getInput('organization_name',  { required: true });
        const repositoryName = core.getInput('repository_name',  { required: true });

        const client = new github.GitHub(token);

        await removeAllColumnLabels(client, organizationName, repositoryName, issueId);

        core.info(`Removed former column label from issue #${issueId} in repository ${organizationName}/${repositoryName}.`);
    }
    catch (error) {
        core.setFailed(error.message);
    }
}

run();
