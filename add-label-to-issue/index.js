const core = require('@actions/core');
const github = require('@actions/github');

function titleCase(name) {
    const words = name.split(' ');
    const upperCasedWords = words.map(word => word.charAt(0).toUpperCase() + word.substring(1));
    return upperCasedWords.join(' ');
}

function getAllColumnLabelNames(client, owner, repo){
    return client.issues.listLabelsForRepo({ owner, repo })
        .then( response => response.data.map(label => label.name))
}

async function addLabelToIssue(client, owner, repo, issueId, label, allColumnLabels) {
    const [newLabel] = allColumnLabels.filter(columnLabel => titleCase(columnLabel) === titleCase(label));

    if (newLabel) {
        await client.issues.addLabels({
            owner,
            repo,
            issue_number: issueId,
            labels: [newLabel]
        });
        return true;
    }
    else {
        return false;
    }

}

async function run() {
    try {
        const token = core.getInput('token', { required: true });
        const issueId = core.getInput('issue_id',  { required: true });
        const organizationName = core.getInput('organization_name',  { required: true });
        const repositoryName = core.getInput('repository_name',  { required: true });
        const label = core.getInput('label',  { required: true });

        const client = new github.GitHub(token);

        const allColumnLabels = await getAllColumnLabelNames(client, organizationName, repositoryName);

        const result = await addLabelToIssue(client, organizationName, repositoryName, issueId, label, allColumnLabels);

        if (result){
            core.info(
                `Added label "${label}" to issue #${issueId} in repository ${organizationName}/${repositoryName}.`
            );
        } else {
            core.info(`Failed to add label "${label}" because it is not on allowed: ${allColumnLabels.join(", ")}`)
        }

    }
    catch (error) {
        core.setFailed(error.message);
    }
}

run();
