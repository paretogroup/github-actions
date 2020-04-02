const core = require('@actions/core');
const github = require('@actions/github');

function extractIssueIdFromCard(card, organizationName, repositoryName) {
    const contentUrl = card.data.content_url;

    const regex = new RegExp(`${organizationName}/${repositoryName}/issues\\/(\\d+)$`);
    const match = contentUrl.match(regex);

	if (!match) {
		throw new Error('Failed to get issue id');
	}

    return parseInt(match[1], 10);
}

function extractProjectIdFromProjectUrl(projectUrl) {
    const match = projectUrl.match(/projects\/(\d+)$/);

    if (!match) {
        throw new Error('Failed to get issue id');
    }

    return parseInt(match[1], 10);
}

async function getIssueId(client, cardId, organizationName, repositoryName) {
    const card = await client.projects.getCard({card_id: parseInt(cardId)});
    return extractIssueIdFromCard(
        card,
        organizationName,
        repositoryName
    ).toString();
}

async function getColumnName(client, columnId) {
    const column = await client.projects.getColumn({column_id: parseInt(columnId)});
    return column.data.name;
}

async function getAllColumnNames(client, projectURL) {
    const projectId = extractProjectIdFromProjectUrl(projectURL);
    const allColumns = await client.projects.listColumns({project_id: projectId});
    return allColumns.data.map(column => column.name).join(',');
}

async function setIssueIdOutput(client) {
    const cardId = core.getInput('project_card_id', {required: true});
    const organizationName = core.getInput('organization_name', {required: true});
    const repositoryName = core.getInput('repository_name', {required: true});

    const issueId = await getIssueId(client, cardId, organizationName, repositoryName);

    console.log(`issue_id: ${issueId}`);
    core.setOutput('issue_id', issueId);
}

async function setColumnNameOutput(client) {
    const columnId = core.getInput('column_id', {required: true});

    const columnName = await getColumnName(client, columnId);

    console.log(`column_name: ${columnName}`);
    core.setOutput('column_name', columnName);
}

async function setAllColumnNamesOutput(client) {
    const projectURL = core.getInput('project_url',  { required: true });

    const allColumnNames = await getAllColumnNames(client, projectURL);

    console.log(`all_column_names: ${allColumnNames}`);
    core.setOutput('all_column_names', allColumnNames);
}

async function run() {
    try {
        const token = core.getInput('token', {required: true});
        const client = new github.GitHub(token);

        await setIssueIdOutput(client);
        await setColumnNameOutput(client);
        await setAllColumnNamesOutput(client);
    }
    catch (error) {
        core.setFailed(error.message);
    }
}

run();
