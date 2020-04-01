const core = require('@actions/core');
const github = require('@actions/github');

async function run() {
    try {
        const token = core.getInput('token', { required: true });
        const columnId = core.getInput('column_id',  { required: true });

        const client = new github.GitHub(token);
        const column = await client.projects.getColumn({ column_id: parseInt(columnId) });

        console.log(column);
        core.setOutput('column_name', column.name);
    }
    catch (error) {
        core.setFailed(error.message);
    }
}

run();
