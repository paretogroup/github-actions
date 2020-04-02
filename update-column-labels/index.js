const core = require('@actions/core');
const github = require('@actions/github');

function titleCase(name) {
    const words = name.split(' ');
    const upperCasedWords = words.map(word => word.charAt(0).toUpperCase() + word.substring(1));
    return upperCasedWords.join(' ');
}

async function removeAllColumnLabels(client, owner, repo, issue_number, allColumnNames) {
    core.info(`Removing former column label from issue #${issue_number} in repository ${owner}/${repo}.`);
    return Promise.all(
        allColumnNames.map(label => {
            client.issues.removeLabel({ owner, repo, issue_number, name: label.name });
        })
    )
}

async function addColumnLabel(client, owner, repo, issue_number, allColumnNames, columnName) {
    await client.issues.addLabels({
        owner,
        repo,
        issue_number,
        labels: [titleCase(columnName)]
    });

    core.info(
        `Added label "${columnName}" to issue #${issue_number} in repository ${owner}/${repo}.`
    );
}

async function run() {
    try {
        const token = core.getInput('token', { required: true });
        const organizationName = core.getInput('organization_name',  { required: true });
        const repositoryName = core.getInput('repository_name',  { required: true });
        const issueId = core.getInput('issue_id',  { required: true });
        const allColumnNames = core.getInput('all_column_names',  { required: true }).split(",");
        const columnName = core.getInput('column_name',  { required: true });

        const client = new github.GitHub(token);

        await removeAllColumnLabels(client, organizationName, repositoryName, issueId, allColumnNames);
        await addColumnLabel(client, organizationName, repositoryName, issueId, allColumnNames, columnName);
    }
    catch (error) {
        core.setFailed(error.message);
    }
}

run();
