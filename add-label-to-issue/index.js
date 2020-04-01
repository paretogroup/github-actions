const core = require('@actions/core');
const github = require('@actions/github');

async function run() {
    try {
        const token = core.getInput('token', { required: true });
        const issueId = core.getInput('issue_id',  { required: true });
        const organizationName = core.getInput('organization_name',  { required: true });
        const repositoryName = core.getInput('repository_name',  { required: true });
        const label = core.getInput('label',  { required: true });

        const client = new github.GitHub(token);

        await client.issues.addLabels({
            owner: organizationName,
            repo: repositoryName,
            issue_number: issueId,
            labels: [label]
        });

        core.info(`Added label "${label}" to issue #${issueId} in repository ${organizationName}/${repositoryName}.`);
    }
    catch (error) {
        core.setFailed(error.message);
    }
}

run();
