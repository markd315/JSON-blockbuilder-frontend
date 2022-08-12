'use strict';

Blockly.JSON = new Blockly.Generator('JSON');

//-------------------------------------------------------------------------------------------------
Blockly.JSON.generalBlockToObj = function(block) {
    if(block) {
        var func = this[block.type];
        if(func) {
            return func.call(this, block);
        } else {
            console.log("Don't know how to generate JSON code for a '"+block.type+"'");
        }
    } else {
        return null;
    }
};

//TODO add additional validations for these custom schemas later.
function loadCustomSchemaMappers(){
  let xhttp = new XMLHttpRequest();
  xhttp.onreadystatechange = function() {
    if (this.readyState == 4 && this.status == 200) {
      const regex = /<li><a href=\"\/schema\/(.*?).json\"/gm;
      let m;
      while ((m = regex.exec(this.responseText)) !== null) {
        // This is necessary to avoid infinite loops with zero-width matches
        if (m.index === regex.lastIndex) {
          regex.lastIndex++;
        }
        // The result can be accessed through the `m`-variable.
        m.forEach((match, groupIndex) => {
          if(groupIndex == 1){
            Blockly.JSON[match] = function(block) {
                var dictionary = {};
                for(var i = 0; i<block.length; i++) {
                    var pair_key    = block.getFieldValue( 'key_field_'+i );
                    var pair_value  = this.generalBlockToObj( block.getInputTargetBlock( 'element_'+i ) );
                    dictionary[pair_key] = pair_value;
                }
                return dictionary;
            };
            Blockly.JSON[match + '_array'] = function(block) {
                var array = [];
                for(var i = 0; i<block.length; i++) {
                    var element_value  = this.generalBlockToObj( block.getInputTargetBlock( 'element_'+i ) );
                    array[i] = element_value;
                }
                return array;
            };
          }
        });
      }
    }
  };
  xhttp.open("GET", '/schema/', true);
  xhttp.send();
}
loadCustomSchemaMappers();
//-------------------------------------------------------------------------------------------------
Blockly.JSON.fromWorkspace = function(workspace) {
    var json_text = '';
    var top_blocks = workspace.getTopBlocks(false);
    for(var i in top_blocks) {
        var top_block = top_blocks[i];
        if(top_block.type == 'start') {
            var json_structure = this.generalBlockToObj( top_block );

            json_text += JSON.stringify(json_structure, null, 4) + '\n\n';
        }
    }
    return json_text;
};

Blockly.JSON.fromWorkspaceStructure = function(workspace) {
    var json_text = '';
    var top_blocks = workspace.getTopBlocks(false);
    for(var i in top_blocks) {
        var top_block = top_blocks[i];
        if(top_block.type == 'start') {
            var json_structure = this.generalBlockToObj( top_block );

            json_text += JSON.stringify(json_structure, null, 4) + '\n\n';
        }
    }
    return json_text;
};
//-------------------------------------------------------------------------------------------------
Blockly.JSON['start'] = function(block) {
    var json    = this.generalBlockToObj( block.getInputTargetBlock( 'json' ) );
    return json;
};
//-------------------------------------------------------------------------------------------------
Blockly.JSON['boolean'] = function(block) {
    var boolean = block.getFieldValue('boolean');
    if (boolean == 'true'){
        return true;
    }else{
        return false;
    }
};
//-------------------------------------------------------------------------------------------------
Blockly.JSON['string'] = function(block) {
    var string_value = block.getFieldValue( 'string_value' );
    return string_value ;
};
//-------------------------------------------------------------------------------------------------
Blockly.JSON['number'] = function(block) {
    var number_value = Number(block.getFieldValue( 'number_value' ));
    return number_value ;
};
//-------------------------------------------------------------------------------------------------
Blockly.JSON['dictionary'] = function(block) {
    var dictionary = {};
    for(var i = 0; i<block.length; i++) {
        var pair_key    = block.getFieldValue( 'key_field_'+i );
        var pair_value  = this.generalBlockToObj( block.getInputTargetBlock( 'element_'+i ) );
        dictionary[pair_key] = pair_value;
    }
    return dictionary;
};
//-------------------------------------------------------------------------------------------------
Blockly.JSON['dynarray'] = function(block) {
    var array = [];
    for(var i = 0; i<block.length; i++) {
        var element_value  = this.generalBlockToObj( block.getInputTargetBlock( 'element_'+i ) );

        array[i] = element_value;
    }
    return array;
};

let arrTypes = ['string_array', 'number_array', 'bool_array'];

for(var t in arrTypes){
    Blockly.JSON[arrTypes[t]] = function(block) {
    var array = [];
    for(var i = 0; i<block.length; i++) {
        var element_value  = this.generalBlockToObj( block.getInputTargetBlock( 'element_'+i ) );

        array[i] = element_value;
    }
    return array;
    };
}