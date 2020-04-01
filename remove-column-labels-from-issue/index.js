const core = require('@actions/core');
const github = require('@actions/github');

const columnLabels = [
    'To Do',
    'In Progress',
    'PR Review',
    'Released'
];

async function removeAllColumnLabels(client, owner, repo, issue_number) {
    return Promise.all(
        columnLabels.map((name) => {
            client.issues.removeLabel({
                owner,
                repo,
                issue_number,
                name
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
