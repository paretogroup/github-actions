const core = require('@actions/core');
const github = require('@actions/github');

function extractIssueIdFromCardContentUrl(
    contentUrl,
    organizationName,
    repositoryName
) {
    const regex = new RegExp(`${organizationName}/${repositoryName}/issues\\/(\\d+)$`);
    const match = contentUrl.match(regex);

	if (!match) {
		throw new Error('Failed to get issue id');
	}

	return parseInt(match[1], 10);
}

async function run() {
    try {
        const token = core.getInput('token', { required: true });
        const cardId = core.getInput('project_card_id',  { required: true });
        const organizationName = core.getInput('organization_name',  { required: true });
        const repositoryName = core.getInput('repository_name',  { required: true });

        const client = new github.GitHub(token);
        const card = await client.projects.getCard({ card_id: parseInt(cardId) });

        const issueId = extractIssueIdFromCardContentUrl(
            card.data.content_url,
            organizationName,
            repositoryName
        );

        console.log(issueId);
        core.setOutput('issue_id', issueId.toString());
    }
    catch (error) {
        core.setFailed(error.message);
    }
}

run();
