'use strict';


var dfsIdx = 0;
Blockly.JSON.toWorkspace = function(json_text, workspace, dfsMemo) {
	var json_structure  = JSON.parse(json_text);
	workspace.clear();
	var startBlock = workspace.newBlock('start');
	startBlock.initSvg();
	startBlock.render();
	dfsIdx = 0;
	Blockly.JSON.buildAndConnect(json_structure, startBlock.getInput('json').connection, dfsMemo);
};

Blockly.JSON.buildAndConnect = function(json_structure, parentConnection, dfsMemo) {
	if(json_structure === null) {
		return;
	} else {
		var json_keys = Object.keys(json_structure);
		var type  = typeof(json_structure);
		var json_values = Object.values(json_structure);
		if(type == 'object') {
			type = (json_structure instanceof Array) ? 'dynarray' : 'dictionary';
		}
        let workspace = parentConnection.sourceBlock_.workspace
		var targetBlock = workspace.newBlock(dfsMemo[dfsIdx]);
		dfsIdx+=1;
		targetBlock.initSvg();
		targetBlock.render();

		var childConnection = targetBlock.outputConnection;
		parentConnection.connect(childConnection);

		switch(targetBlock.type) {
			case 'string':
				targetBlock.setFieldValue( String(json_structure), 'string_value' );
				break;
			case 'number':
				targetBlock.setFieldValue( String(json_structure), 'number_value' );
				break;
			case 'boolean':
				targetBlock.setFieldValue(String(Boolean(json_structure)), 'bool');
				break;
			case 'dictionary':
				var i=0;
				for(var key in json_structure) {
					targetBlock.appendKeyValuePairInput();
					targetBlock.setFieldValue( key, 'key_field_'+i );
					var elementConnection = targetBlock.getInput('element_'+i).connection;
					Blockly.JSON.buildAndConnect(json_structure[key], elementConnection);
					i++;
				}
				break;
			case 'dynarray':
				for(var i in json_structure) {
					targetBlock.appendElementInput();
					var elementConnection = targetBlock.getInput('element_'+i).connection;
					Blockly.JSON.buildAndConnect(json_structure[i], elementConnection);
				}
				break;
			default:
			    console.log("retrieing custom block");
			    for(var i in json_structure) {
			        console.log(targetBlock);
					targetBlock.appendKeyValuePairInput();
					var elementConnection = targetBlock.getInput('element_'+i).connection;
					Blockly.JSON.buildAndConnect(json_structure[i], elementConnection);
				}
				break;
		}
	}
};
