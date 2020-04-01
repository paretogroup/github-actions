const core = require('@actions/core');
const github = require('@actions/github');

async function run() {
    try {
        const token = core.getInput('token', { required: true });
        const issueId = core.getInput('issue-id',  { required: true });
        const organizationName = core.getInput('organization-name',  { required: true });
        const repositoryName = core.getInput('repository-name',  { required: true });
        const label = core.getInput('label',  { required: true });

        const client = new github.GitHub(token);

        await client.issues.removeLabel({
            owner: organizationName,
            repo: repositoryName,
            issue_number: issueId,
            name: label
        });

        core.info(`Removed label "${label}" from issue #${issueId} in repository ${organizationName}/${repositoryName}.`);
    }
    catch (error) {
        core.setFailed(error.message);
    }
}

run();
