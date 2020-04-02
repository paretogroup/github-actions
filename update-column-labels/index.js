const core = require('@actions/core');
const github = require('@actions/github');

function titleCase(name) {
    const words = name.split(' ');
    const upperCasedWords = words.map(word => word.charAt(0).toUpperCase() + word.substring(1));
    return upperCasedWords.join(' ');
}

async function removeAllColumnLabels(client, owner, repo, issue_number, allColumnNames) {
    core.info(`Removing former column label from issue #${issue_number} in repository ${owner}/${repo}.`);
    console.log(allColumnNames);
    return Promise.all(
        allColumnNames.map( name =>
            client.issues.removeLabel({ owner, repo, issue_number, name: titleCase(name) })
                .catch(error => console.log(error))
        )
    )
}

async function addColumnLabel(client, owner, repo, issue_number, columnName) {
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
        console.log(`issue_id: ${issueId}`);

        const allColumnNamesString = core.getInput('all_column_names',  { required: true });
        console.log(`all_column_names: ${allColumnNamesString}`);

        const allColumnNames = allColumnNamesString.split(",");
        const columnName = core.getInput('column_name',  { required: true });
        console.log(`column_name: ${columnName}`);

        const client = new github.GitHub(token);

        await removeAllColumnLabels(client, organizationName, repositoryName, issueId, allColumnNames);
        await addColumnLabel(client, organizationName, repositoryName, issueId, columnName);
    }
    catch (error) {
        core.setFailed(error.message);
    }
}

run();
