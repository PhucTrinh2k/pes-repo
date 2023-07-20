var pathArray = window.location.pathname.split('/');
var contextPath = '/' + pathArray[1];
var migrationServer = $('#userMigrationServer').val();
var secretKey = $('#secretKey').val();
var connectionStepName = $('#connectionStepName').text().trim();
var systemStepName = $('#systemStepName').text().trim();
var queryBuilderStepName = $('#queryBuilderStepName').text().trim();
var configStored_msg = $('#configStored').text().trim();
var configEnabled_msg = $('#configEnabled').text().trim();
var configDisabled_msg = $('#configDisabled').text().trim();

var queryUpdated_msg = $('#queryUpdated').text().trim();
var cancelStep_msg = $('#cancelStep').text().trim();
var joinSetupConfirmation_msg = $('#joinSetupConfirmation').text().trim();
var changeStepEnableEdit_msg = $('#changeStepEnableEdit').text().trim();

var emptyConfigName_msg = $('#emptyConfigName').text().trim();
var testConnection_msg = $('#testConnection').text().trim();
var emptyIdSchedule_msg = $('#emptyIdSchedule').text().trim();
var stepNotComplete_msg = $('#stepNotComplete').text().trim();
var noJoinColumn_msg = $('#noJoinColumn').text().trim();
var noJoinType_msg = $('#noJoinType').text().trim();
var allAliases_msg = $('#allAliases').text().trim();

const MIGRATION_STEP = {
    CONNECTION: 'connection',
    SYSTEM: 'system',
    QUERY_BUILDER: 'query_builder'
}
const DEFAULT_QUERY_DESCRIPTION =  JSON.stringify({select : {}, from: {}, joins: []});

const DEFAULT_QUERY_BUILDER_PROP = JSON.stringify( 
    {
        query_description: {
            select : {},
            from: {},
            joins: []
        }
    });

const DB_WITH_NO_SCHEMA = ['MySQL', 'SQLite', 'SyBase', 'Oracle'];

const DEFAULT_FILE_NAME = 'No file chosen';

const DEFAULT_STEP_CHANGE_CONFIRM = "If you proceed, your query building progress will be reverted to the latest saved. If you want to save your query building progress, please go back and press 'Save Query & Previous' button";

var commonJs = {
    interVal: false,
    callAjax: function (data) {
        var DATABOARDNAMED = DATABOARDNAMED;
        if (!this.interVal && !window.DATABOARDNAMED) {
            loadingShow();
        }
        var returnData = null;
        var http_headers = {};
        http_headers.W_MENU_ID = G_CURRENT_MENU_CODE;

        // 임시로 alert에만 걸어놓음
        if (data._type == 'PUT' || data._type == 'DELETE') {
            http_headers._Method = data._type;
            data._type = 'POST';
        }
        $.ajax({
            type: data._type,
            url: data._url,
            data: data._data,
            dataType: data._dataType,
            headers: http_headers,
            contentType: data._contentType,
            async: data._async,
            error: function (request, status, error) {
                if (data._callback) {
                    data._errorType = 'COMM';
                    data._callback(data);
                } else {
                    alert('통신실패!!');
                }
            },
            success: function (data) {
                if (data && data.header && data.header.expired) {
                    alert(
                        '중복로그인 및 기타사유로 세션이 만료되었거나 사용자 인증이 필요한 페이지입니다.'
                    );
                    location.href = G_CONTEXT_PATH;
                    return;
                }
                if (data && data.header && data.header.resultCode == '500') {
                    alert(data.header.resultMessage);
                    return null;
                }
                returnData = data;
            },
        });

        return returnData;
    },
};
let queryBuilderComponent = {
    template: '#queryBuilder',
    // props: ['opUserConfigProp', 'schemasProp','queryProp', 'querydescriptionProp', 'isUpdateConfigProp'],
    props: {
        opUserConfigProp: {
            type: Object,
            required: true,
        },
        schemasProp: {
            type: Array,
            required: true,
        },
        queryProp: {
            type: String,
            default: '',
        },
        querydescriptionProp: {
            type: Object
        },
        isUpdateConfigProp: {
            type: Boolean,
            required: true,
            default: false
        },
        dbTypeProp: {
            type: String,
            required: true,
            default: 'Postgres'
        },
        isCustomQueryProp: {
            type: Boolean,
            required: true,
            default: false
        },
        isEnableSaveConfigProp: {
            type: Boolean,
            required: true,
            default: false
        }
    },
    data: function () {
        return {
            schemas: null,
            opUserConfig: {},
            schemaIndex: null,
            tableIndex: null,
            selected: [
                { 
                    selectedSchema: '',
                    selectedTable: '',
                    columns: [],
                    resultData: null,
                    tables: [],
                }
            ],
            opuserColumns: [],
            query: '',
            // customQuery: '',
            query_description: {
                select : {},
                from: {},
                joins: []
            },
            aliasColumns: [
                'USER_NAME',
                'LOGIN_USER_ID',
                'IPADDR',
                'PC_NAME',
                'DEL_YN',
                'DEPT1',
                'DEPT2',
                'DEPT3',
                'DEPT_CD1',
                'DEPT_CD2',
                'DEPT_CD3',
                'POSITION',
                'DUTY',
                'NOTE',
                'EMAIL',
                'USER_STATUS',
            ],
            draggedBox: '',
            joinColumns: [],
            joinTypes: [],
            deleteColumnVisible: [],
            mapAliasColumn: {},
            showFlag: false,
            changedByUser: true,
            boxMapped: false,
            isCustomQuery: this.isCustomQueryProp,
            isEnableSaveConfig: this.isEnableSaveConfigProp,
        };
    },
    mounted() {
        this.receiveProps();
        this.createWatcher(0);
        this.addTableCanvas(this.query_description);
        // if (DB_WITH_NO_SCHEMA.includes(this.dbTypeProp)) {
        //     this.getTables('', 0)
        // }
    },
    beforeUpdate() {
        this.$nextTick(function () {
            var allHaveTH = true;
            $('.selectpicker').selectpicker('refresh');
            $('.selectpicker').selectpicker({
                dropupAuto: false,
            });            
            $('#joinSetup .select-picker').selectpicker('refresh');
            if ($('.table-selected').length === 0) {
                allHaveTH = false;
            } else if ($('.table-selected').length === this.selected.length ) {
                $('.table-selected').each((i, element) => {
                    if ($(element).find('th[id^="tHead"]').length === 0) {
                        allHaveTH = false;
                    }
                });
             }
            if (allHaveTH && !this.boxMapped) {  
                this.mapBoxToColumn(this.mapAliasColumn);
                this.boxMapped = true;
                this.updateJoinSetup(this.query_description);
            }
        });
    },
    methods: {
        dragStartEventHandler(event) {
            this.changedByUser = true;
            this.draggedBox = "box" + event.target.id;
            event.dataTransfer.setData(this.draggedBox , event.target.id);
            var parentElement = event.target.parentElement;
            if (parentElement.id.startsWith('tHead')) {
                var cus_column_name = parentElement.innerText.split('\n')[parentElement.innerText.split('\n').length - 1];
                var selectedIndex = parentElement.id.substring(6,7);
                this.selected[selectedIndex].columns.find(column => column.columnName === cus_column_name).isSelected = false;
                this.selected[selectedIndex].columns.find(column => column.columnName === cus_column_name).alias = '';

                var alias = event.target.innerText.split('\n')[0];
                this.query_description.select[alias] = '';
            }
           

        },
        receiveProps() {
            this.changedByUser = false;
            // this.schemas = JSON.parse(JSON.stringify(this.schemasProp));
            // this.opUserConfig = JSON.parse(JSON.stringify(this.opUserConfigProp));
            // this.query = JSON.parse(JSON.stringify(this.queryProp));
            // this.query_description = JSON.parse(JSON.stringify(this.querydescriptionProp));
            // this.query_description = this.querydescriptionProp ? JSON.parse(JSON.stringify(this.querydescriptionProp)) : JSON.parse(DEFAULT_QUERY_DESCRIPTION) ;
            // this.opuserColumns = JSON.parse(JSON.stringify(this.opuserColumnsProp));
            this.query = this.queryProp 
            this.schemas = _.cloneDeep(this.schemasProp);
            this.opUserConfig = _.cloneDeep(this.opUserConfigProp);
            this.query_description = this.querydescriptionProp ? _.cloneDeep(this.querydescriptionProp) : JSON.parse(DEFAULT_QUERY_DESCRIPTION) ;
        },
        cloneBox(_, id) {
            var _this = this;
            var removedBox = document.createElement('div');
            
            removedBox.innerHTML = this.aliasColumns[id];
            removedBox.classList.add('draggable-box');
            removedBox.classList.add('text-center');
            if ([0, 1, 4, 15].includes(Number(id))) {
                removedBox.classList.add('required');
            }
            removedBox.setAttribute('draggable', true);
            removedBox.setAttribute('id', id);
            removedBox.addEventListener('dragstart', (event) => {
                _this.dragStartEventHandler(event);
            });

            var content = this.formattedTooltipText(id);
            let $newDiv = $('<div/>')  
                .addClass('tooltiptext') 
                .html(content);  
            $(removedBox).append($newDiv);
            
            return removedBox;
        },
        reloadAllBox() {
            for (let item of this.selected) {
                for (let i = 0; i < item.columns.length; i++) {
                    var selector = "#tHead-"+ this.selected.indexOf(item) + '-' + item.columns[i].columnName;
                    var tHeadElement = document.querySelector("th"+selector);
                    if (tHeadElement === null){
    					return;
    				} else if (tHeadElement.childElementCount === 0) {
                        continue;
                    } else {
                        var removedBoxId = tHeadElement.firstElementChild.getAttribute("id");
                        var removedBox = this.cloneBox(_, removedBoxId);
                        document.getElementById('box-container').appendChild(removedBox);
                        tHeadElement.removeChild(tHeadElement.firstElementChild);
                    }
                }
            }
        },

        updateJoinSetup(queryDescription) {
            let joinColumnIndex = 0;
            for (let i = 0; i < queryDescription.joins.length; i++) {
                let joinPair = queryDescription.joins[i].condition.split(' AND ');
                for (let idx = 0; idx < joinPair.length; idx++) {
                    let fullColumnNames = joinPair[idx].split(' = ');
                    this.joinColumns[joinColumnIndex][idx] = fullColumnNames[0].split('.')[2];
                    this.joinColumns[joinColumnIndex+1][idx] = fullColumnNames[1].split('.')[2];
                }
                
                this.joinTypes[joinColumnIndex] = queryDescription.joins[i].type;
                joinColumnIndex = joinColumnIndex + 2;
            }
        },

        formattedTooltipText(index) {
            return [0, 1, 4, 15].includes(Number(index))
              ? (Number(index) === 4
                  ? "Required <br/> Data Type: bpchar(1)"
                  : (Number(index) === 15
                      ? "Required <br/> Default Value: NORMAL"
                      : "Required <br/> Data Type: varchar"))
              : "Not Required <br/> Data Type: varchar";
        },
        // JQuery  
        // addBoxToTHead(parentEl, addedBoxId, selectedIndex) {
        //     var parentElId = $(parentEl)[0].id;
        //     var index = parentElId.substring(8); 
        //     var $box = $('#' + addedBoxId);

        //     var columnName = this.selected[selectedIndex].columns[index].columnName;
        //     $('#' + parentElId).html('');
        //     // parentEl.innerHTML = '';

        //     $('#' + parentElId).prepend($box, columnName);

        // },
        addTableCanvas(queryDescription) {
            
            if(!queryDescription || JSON.stringify(queryDescription) === DEFAULT_QUERY_DESCRIPTION ){
                return;
            }
            this.showFlag = true;
            for (let alias in queryDescription.select) {
                const selectedColumn = queryDescription.select[alias];
                const aliasMapping = this.aliasColumns.indexOf(alias);
                if (selectedColumn !== '') {
                    this.mapAliasColumn[aliasMapping] = selectedColumn;
                }
            }
            this.changedByUser = false;
            const numbersOfTable = queryDescription.joins.length + 1;
            this.selected[0].selectedSchema = queryDescription.from.schema;
            this.selected[0].selectedTable = queryDescription.from.table;
            for (let i = 1; i < numbersOfTable; i++) {
                this.addTable();
                this.selected[i].selectedSchema = queryDescription.joins[i-1].table.schema;
                this.selected[i].selectedTable = queryDescription.joins[i-1].table.table;
            }

        },
        mapBoxToColumn(mapAliasColumn) {
            //table
            let selectedIndex;
            for (let aliasIndex in mapAliasColumn) {
                let selectedColumn = mapAliasColumn[aliasIndex];
                let column = this.seperateSchemaTableColumn(selectedColumn);
                if (column.tableName === this.query_description.from.table
                    && column.schemaName === this.query_description.from.schema) {
                    selectedIndex = 0;
                } else {
                    let index = this.query_description.joins.findIndex(function (obj) {
                        return obj.table.table === column.tableName && obj.table.schema === column.schemaName;
                    })
                    selectedIndex = index + 1;

                }                
                let parentElId = "tHead-" + selectedIndex + "-" + column.columnName;
                this.addBoxToThead(parentElId, aliasIndex, false);
            }      

        },
        seperateSchemaTableColumn(pattern) {
            const regex = /^([^.]*)\.([^.]*)\.([^.]*)$/;
            const match = regex.exec(pattern);
            let schemaName = match[1];
            let tableName = match[2];
            let columnName = match[3]
            return {
                schemaName,
                tableName,
                columnName
            }
        },

        addBoxToThead(parentElId, addedBoxId, isDragging) {
            var $box = $('#' + addedBoxId);
            
            if (isDragging) {
                var columnName = $('#' + parentElId).html();
                $('#' + parentElId).html('');
                $('#' + parentElId).prepend($box, columnName);
            } else {
                var removedBox = this.cloneBox(_, addedBoxId);
                $('#box-container').find($box).remove();
                var columnName = $('#' + parentElId).html();
                $('#' + parentElId).html('');
                $('#' + parentElId).prepend(removedBox, columnName);
            }

        },
        allowDrop(event) {
            event.preventDefault();
        },
        dropEventHandler(event, selectedIndex, columnIndex) {
            event.preventDefault();
            var data = event.dataTransfer.getData(this.draggedBox);

            if (columnIndex) {
                if (this.selected[selectedIndex].columns[columnIndex].isSelected ) {
                    var unselectColumnAlias = this.selected[selectedIndex].columns[columnIndex].alias;
                    this.query_description.select[unselectColumnAlias] = ''; 
                }

            }
            if (event.target.id.startsWith('tHead')) {
                if (event.target.childElementCount > 0) {
                    var parentElement = event.target;
                    var removedBoxId = parentElement.firstElementChild.id;

                    var removedBox = this.cloneBox(_, removedBoxId);

                    parentElement.removeChild(parentElement.lastElementChild);
                    document.getElementById('box-container').appendChild(removedBox);                    
                }
                this.addBoxToThead(event.target.id, data, true)
                
            } else if( /^[0-9]/.test(event.target.id)) {
                var parentElement = event.target.parentElement;
                if (parentElement.id.startsWith('tHead')) {
                    var removedBoxId = event.target.id;

                    var removedBox = this.cloneBox(_, removedBoxId);
                    event.target.remove();
    
                    document.getElementById('box-container').appendChild(removedBox);
                    // this.addBoxToTHead(parentElement, data, selectedIndex);
                    this.addBoxToThead(parentElement.id, data, true)
                    //append box to tHead
                }
                else {
                    $(parentElement).append($('#' + data));
                    //append box to box-container
                }
            } 

            else {
                event.target.appendChild(document.getElementById(data));
            }
            if ( event.target.id.startsWith('tHead') && columnIndex+1 || /^[0-9]/.test(event.target.id) && columnIndex+1 ) {
                this.selected[selectedIndex].columns[columnIndex].isSelected = true;
                this.selected[selectedIndex].columns[columnIndex].alias = this.aliasColumns[data];
            }
            this.generateQuery();
        },
        generateQuery() {
            var _this = this;
            var query = this.opUserConfig.customColumns ? 'SELECT ' + this.opUserConfig.customColumns + ',' : 'SELECT ';
            var columnAlias = [];
            var checkEmptyQuery = true;
            var queryJoin = '';
            var selectedCol = [];
            var joiner = [];


            for (let index = 0; index < this.selected.length; index++) {

                selectedCol = _.filter(this.selected[index].columns, function (o) {
                    return o.isSelected;
                }); //get Selected Columns
                if (selectedCol.length) {checkEmptyQuery = false;}
                for (var i = 0; i < selectedCol.length; i++) {
                    columnAlias.push( 
                        // this.selected[index].selectedSchema + "."+ this.selected[index].selectedTable + "." + selectedCol[i].columnName +
                        // ' AS ' + selectedCol[i].alias
                        "t" + index + "." + selectedCol[i].columnName +
                        ' AS ' + selectedCol[i].alias
                    );
                    let alias = selectedCol[i].alias;
                    this.query_description.select[alias] = this.selected[index].selectedSchema + "." + this.selected[index].selectedTable + "." + selectedCol[i].columnName;

                }
            }
            
            this.query = query + columnAlias.join(", ") + " FROM " + this.selected[0].selectedSchema + "." + this.selected[0].selectedTable + " t0";
            this.query_description.from = {
                schema: _this.selected[0].selectedSchema,
                table: _this.selected[0].selectedTable
            }

            if (this.selected.length > 1) {
                
                var joinColumnIndex = 0;
                var id = 0;
                for (let index = 1; index < this.selected.length; index++) {
                    
                    // for (let i = 0; i < this.joinColumns[id].length; i++) {
                    //     joiner.push( this.selected[index - 1].selectedSchema + "." + this.selected[index - 1].selectedTable + "." + this.joinColumns[joinColumnIndex][i] + ' = ' +  this.selected[index].selectedSchema + "." + this.selected[index].selectedTable + "." + this.joinColumns[joinColumnIndex + 1][i]);

                    // }
                    for (let i = 0; i < this.joinColumns[id].length; i++) {
                        joiner.push( "t" + (index-1) + "." + this.joinColumns[joinColumnIndex][i] + ' = ' + "t"+ index + "." + this.joinColumns[joinColumnIndex + 1][i]);

                    }
                    queryJoin = this.selected[index].selectedSchema + "." + this.selected[index].selectedTable + " t" + index +" ON " + joiner.join(' AND ');
                    // append to this.query
                    this.query = this.query + ' '+ this.joinTypes[index-1]+' '+ queryJoin;
                    
                    this.query_description.joins[index-1] = {
                        type: _this.joinTypes[index-1],
                        table: {
                            schema: _this.selected[index].selectedSchema,
                            table: _this.selected[index].selectedTable
                        },
                        condition: joiner.join(' AND ') 
                    }
                    

                    queryJoin = '';
                    joiner = [];
                    id += 2;
                    joinColumnIndex += 2;
                }
            } 
            if (checkEmptyQuery) {
                this.query = '';
            }
            this.query = this.formatFrontQuery(this.query);
        
        },
        // will format query only if isCustomQuery is false
        formatFrontQuery(query) {
            if(this.isCustomQuery) {
                return;
            }
            const formattedSql = query
                .replace(/\s+/g, ' ')
                .replace(/\bSELECT\b/ig, 'SELECT\n ')
                .replace(/,/g, ',\n ')
                .replace(/\bFROM\b/ig, '\nFROM')
                .replace(/\bWHERE\b/ig, '\nWHERE')
                .replace(/\bAND\b/ig, '\n\tAND')
                .replace(/\b(INNER|LEFT|RIGHT)\sJOIN\b/ig, '\n$1 JOIN')
            return formattedSql;
        },
        formatBackQuery(query) {
            const formattedSql = query

                .replace(/\n/g, ' ')
            return formattedSql;
        },
        cloneData: function () {
            var connectionClone = JSON.parse(JSON.stringify(this.opUserConfig));
            connectionClone.username = CryptoJS.AES.encrypt(
                connectionClone.username,
                secretKey
            ).toString();
            connectionClone.password = CryptoJS.AES.encrypt(
                connectionClone.password,
                secretKey
            ).toString();
            return connectionClone;
        },
        getKeyByValue(obj, value) {       
            for (const key in obj) {
                const currentValue = obj[key];
                if (currentValue === value) {
                    return key;
                } 
            }
        },
        getTables(schema, index) {

            var _this = this;
            var connectionClone = this.cloneData(this.opUserConfig);
            connectionClone.schemaName = schema;
            axios
                .post(migrationServer + '/customer-db/tables', connectionClone)
                .then(function (response) {
                    _this.selected[index].tables = response.data.tables;
                })
                .catch(function (e) {
                    alert('업로드 중 에러 발생 : ' + e.message);
                });
        },
        getColumns(table, index) {

            var _this = this;
            var connectionClone = this.cloneData(this.opUserConfig);
            connectionClone.schemaName = this.selected[index].selectedSchema; 
            connectionClone.tableName = table;
            axios
                .post(migrationServer + '/customer-db/columns', connectionClone)
                .then(function (response) {
                    if (
                        response.data &&
                        response.data.columns &&
                        response.data.columns.length
                    ) {
                        response.data.columns.forEach(function (el) {
                            let fullColumnName = _this.selected[index].selectedSchema +
                            "."+ _this.selected[index].selectedTable + "."+ el;
                            const columnAliasIndex = _this.getKeyByValue(_this.mapAliasColumn, fullColumnName);
                            const columnAlias = _this.aliasColumns[columnAliasIndex]
                            if (columnAlias && !_this.changedByUser) {
                            // if fullColumnName in this.mapAliasColumn
                            // then look for alias and update below
                                _this.selected[index].columns.push({
                                    isSelected: true,
                                    columnName: el,
                                    alias: columnAlias,
                                });
                            } else {
                                // or else push normally
                                _this.selected[index].columns.push({
                                    isSelected: false,
                                    columnName: el,
                                    alias: '',
                                });                               
                            }
                        });
                        _this.testQuery('getColumn', index);
                    }
                })
                .catch(function (e) {
                    alert('업로드 중 에러 발생 : ' + e.message);
                });
        },
        testQuery(triggerLocation, index) {
            var _this = this;
            var connectionClone = this.cloneData(this.opUserConfig);
            connectionClone.queryLimit = 5;
            if (triggerLocation === 'getColumn') {
                connectionClone.query = "SELECT * FROM " +  this.selected[index].selectedSchema  + "." + this.selected[index].selectedTable;
            } else {
                connectionClone.query = this.query;
            }

            axios
                .post(
                    migrationServer + '/customer-db/test-query',
                    connectionClone
                )
                .then(function (response) {
                    if (response.data.success) {
                        if (triggerLocation === 'getColumn') {
                            _this.selected[index].resultData = response.data;
                            
                        } else {
                            queryResultModal.$data.resultData = response.data;
                            $('#queryResult').modal('show');
                        }
                    } else {
                        alert('Cannot execute query!');
                    }
                })
                .catch(function (e) {
                    alert('업로드 중 에러 발생 : ' + e.message);
                });
            this.selected[index].columns = this.removeDuplicateObjects(_this.selected[index].columns);
           
        },
        addTable() {
            const newIndex = this.selected.length;
        
            this.selected.push({
                selectedSchema: '',
                selectedTable: '',
                columns: [],
                resultData: null,
                tables: [],
            });
            // if (DB_WITH_NO_SCHEMA.includes(this.dbTypeProp)) {
            //     this.getTables('', newIndex);
            // }
            this.deleteColumnVisible.push(false);
            this.joinColumns.push([""], [""]);
            // Create watchers for the new object
            this.createWatcher(newIndex);
        },
        deleteTable(index) {

            if (this.selected.length <= 1) {
                alert('At least one table must be selected');
                return;
            }

            var _this = this;
            this.showModalConfirmation('Do you want to delete table ' + this.selected[index].selectedSchema + '.' + this.selected[index].selectedTable +'?').then(() => {
                // console.log("User confirmed!");
                _this.changedByUser = true;
                if (index === 0) {
                    _this.joinColumns.splice(0,2);
                } else if (index === _this.selected.length - 1) {
                    _this.joinColumns.splice(_this.joinColumns.length - 2, 2);
                } else {
                    let indexInJoinColumns = 1 + 2 * (index + 1 - 2);
                    _this.joinColumns.splice(indexInJoinColumns, 2);
                }
                _this.joinColumns = _this.joinColumns.map( () => [''] );
                
                _this.reloadAllBox();
                _this.selected.splice(index, 1);
                for (let i = 0; i < _this.selected.length; i++) {
                    for(let idx = 0; idx < _this.selected[i].columns.length; idx++ ) {
                        _this.selected[i].columns[idx].isSelected = false;
                        _this.selected[i].columns[idx].alias = '';
                    } 
                }
                _this.deleteColumnVisible.splice(index, 1);
              }).catch(err => {
                // console.log("User cancelled!", err);
                    return;
              });
   
        },
        addJoinColumns(index) {
            this.joinColumns[index].push('');
            this.joinColumns[index + 1].push('');
        },
        toggleDeleteColumnVisible(index) {
            this.$set(this.deleteColumnVisible, index, !this.deleteColumnVisible[index]);
        },
        deleteJoinColumn(index, idx) {
            var _this = this
            // this.joinColumns[index].splice(this.joinColumns[index].length - 1);
            // this.joinColumns[index + 1].splice(this.joinColumns[index + 1].length - 1);
            if (this.joinColumns[index].length <= 1) {
                alert('Please choose at least 1 pair of join columns for each join');
                return;
            }
            let confirmText = 'Do you want to delete this pair of join columns: ' + this.joinColumns[index][idx] +' = ' + this.joinColumns[index+1][idx] +'?';

            this.showModalConfirmation(confirmText).then(() => {
                // console.log("User confirmed!");
                _this.joinColumns[index].splice(idx, 1);
                _this.joinColumns[index + 1].splice(idx, 1);
              }).catch(err => {
                // console.log("User cancelled!", err);
                    return;
              });
            
            // if ( confirm(confirmText) ) {
            //     this.joinColumns[index].splice(idx, 1);
            //     this.joinColumns[index + 1].splice(idx, 1);
            // }
        },
        saveJoinCoulmn( event ) {

            event.stopPropagation();
            for (let item of this.joinColumns) {
                if (this.alertEmpty(item, noJoinColumn_msg)) {
                    return;
                }
              }
            if (this.alertEmpty(this.joinTypes, noJoinType_msg)) {
                return;
            }
            this.generateQuery();
            $('#joinSetup').modal('hide');

        },
        testRunJob() {
            this.saveQuery(true);
        },
        editCustomQuery(event) {
            // this.customQuery = event.target.value;
            this.query = event.target.value;
        },
        saveQuery(isTestRunningMigration) {
            let count = $("#box-container .draggable-box.required").length;
            if (count > 0 && !this.isCustomQuery) {
                alert(allAliases_msg);
                return;
            }
            // query sent to backend
            this.opUserConfig.query = this.query;
            if (isTestRunningMigration) {
                this.opUserConfig.connectResult = 'Success';
                this.$emit('test-run-job', this.opUserConfig);
                return;
            }
            if (this.isCustomQuery) {
                // this.query = this.customQuery;
                this.query_description = JSON.parse(DEFAULT_QUERY_DESCRIPTION);
            }
            this.$emit('save-db-config', this.query, this.query_description, this.isCustomQuery);
            // $('#queryBuilder').modal('hide');
        },

        closeInner( event ) {
            var _this = this;
            this.showModalConfirmation(joinSetupConfirmation_msg).then(() => {
                // console.log("User confirmed!");
                event.stopPropagation();
                // $('#joinSetup .select-picker').prop('selectedIndex', 0);
                _this.joinColumns = _this.joinColumns.map( () => [''] );
                $('#joinSetup .select-picker').selectpicker('refresh');
                $('#joinSetup').modal('hide');
              }).catch(err => {
                // console.log("User cancelled!", err);
                    return;
              });
            // if (!confirm('Click Save join config to save changes. Closing the modal will reset join setup')) {
            //     return;
            // }
            // event.stopPropagation();
            // // $('#joinSetup .select-picker').prop('selectedIndex', 0);
            // this.joinColumns = this.joinColumns.map( () => [''] );
            // $('#joinSetup .select-picker').selectpicker('refresh');
            // $('#joinSetup').modal('hide');
        },
        resetData() {
            this.schemas = null;
            this.opUserConfig = {};
            this.query = '';
            this.selected = [
                { 
                    selectedSchema: '',
                    selectedTable: '',
                    columns: [],
                    resultData: null,
                    tables: [],
                }
            ],
            this.draggedBox = '';
            this.joinColumns = [];
            this.joinTypes = [];
            this.deleteColumnVisible = [],
            this.query_description = null;
            this.showFlag = false;
            this.changedByUser = true;
            this.boxMapped = false;
            this.mapAliasColumn = {};
        },
        removeDuplicateObjects(arr) {
            return arr.filter((obj, index, self) => {
                return (
                    index ===
                    self.findIndex((t) => JSON.stringify(t) === JSON.stringify(obj))
                );
            });
        },
        unselectColumns( index ) {
            for (let i = 0; i< this.selected.length; i++) {
                if ( i === index) {
                    this.selected[index].columns = [];
                    continue;
                }
                for(let idx = 0; idx < this.selected[i].columns.length; idx++ ) {
                    this.selected[i].columns[idx].isSelected = false;
                    this.selected[i].columns[idx].alias = '';
               } 
            }
            this.query_description = JSON.parse(DEFAULT_QUERY_DESCRIPTION);
        },
        userChangeProperty() {
            this.changedByUser = true;
        },
        showModalConfirmation: function(alertContent) {
            return new Promise((resolve, reject) => {
            //   let confirmModal = $('#confirmModal');
              let confirmBtn = $('#modalConfirmBtn');
              let cancelBtn = $('#modalCancelBtn');
              confirmModal.$data.message = alertContent;

              $('#confirmModal').modal('show');
      
              confirmBtn.one('click', function() {
                resolve(true);
                $('#confirmModal').modal('hide');
              });
              cancelBtn.one('click', function() {
                reject(new Error('User cancelled'));
                $('#confirmModal').modal('hide');
              });
            });
        },
        reloadAsWatcherTriggered(location, newVal, index) {
            this.reloadAllBox();
            if (this.selected[index]) {
                this.selected[index].resultData = null;
            }
         //   this.query = '';
            if (this.changedByUser){
                this.unselectColumns(index);
                this.query = '';              
            } 
            if (location === 'schema' && newVal) {
                this.getTables(newVal, index);
            } else if (location === 'table' && newVal) {
                this.getColumns(newVal, index);
            }
            this.joinColumns = this.joinColumns.map( () => [''] );
        },
        createWatcher(index) {
            var _this = this;
            this.$watch(
              () => _this.selected[index].selectedSchema,
               function (newVal) {
                if (newVal === '') {
                    return;
                }
                _this.reloadAsWatcherTriggered('schema', newVal, index);
                
                // Handle schema change
              },
              
            );
        
            this.$watch(
              () => _this.selected[index].selectedTable,
              (newVal) => {
                if (newVal === '') {
                    return;
                }
                _this.reloadAsWatcherTriggered('table', newVal, index);
                
                // Handle table change
              },
              
            );

        },
        alertEmpty(arrayCheck, text) {
            if (!arrayCheck.length) {
                alert(text);
                this.query = "";
                return true;
            }
            for (let item of arrayCheck) {
                if (!item) {
                    alert(text);
                    this.query = '';
                    return true;
                }
            }
            return false;
        },
        openJoinSetup() {
            this.deleteColumnVisible = this.deleteColumnVisible.map( () => false );
            $('#joinSetup').modal({backdrop: "static"});
        }
    },
    watch:{
        query: function(newVal) {
            this.isEnableSaveConfig = false;
            if (!newVal || this.isCustomQuery) {
                return;
              //alert
            }
            if (this.changedByUser) {
                for (let item of this.joinColumns) {
                    this.alertEmpty(item, 'Please choose join columns in Join Setup');
                    return;
                }
            }
            this.query = this.formatFrontQuery(newVal);
        },
        isCustomQuery: function(newVal) {
            var _this = this;
            if (newVal) {

            } else {
                this.showModalConfirmation(queryUpdated_msg).then(() => {
                    _this.generateQuery();
                }).catch((err) => {
                    console.log(err)
                    //
                })
                
            }
        },
    },
};

var userMigration = new Vue({
    el: '#user-migration',
    components: {
        'query-builder': queryBuilderComponent
    },
    data: function () {
        return {
            systemTypes: ['DB연동', '파일연동'],
            driverList: ['Postgres', 'MySQL', 'SQLServer', 'Oracle'],
            queryLimit: ['5', '10', '20', '50'],
            selectedIndex: 0,
            dbConnectionList: null,
            isExistConfig: false,
            isUpdateConfig: false,
            isUpdateFile: false,
            userStatusList: null,
            systemCodeList: [
                {
                    sysId: 'allSys',
                    sysName: 'All',
                    isChecked: false,
                    subSystem: null,
                },
            ],
            systemListL2: [],
            systemListL3: [],
            limit: 5,
            hasError: false,
            result: {
                responseCode: '',
                responseText: '',
                upload_dir: ''
            },
            lang: '',
            steps: [
                {name: connectionStepName, code: MIGRATION_STEP.CONNECTION, isCompleted: false, isActive: true},
                {name: systemStepName, code: MIGRATION_STEP.SYSTEM, isCompleted: false, isActive: false},
                {name: queryBuilderStepName, code: MIGRATION_STEP.QUERY_BUILDER, isCompleted: false, isActive: false},
            ],
            queryBuilderProp: {
                query_description: {
                    select : {},
                    from: {},
                    joins: []
                },
            },
            driverFile: '',
            isCustomColumnsCorrect: true,
            
        };
    },
    mounted() {
        this.getStatusList();
        // this.getOpuserColumns();
        // this.createWatcher();
    },
    beforeUpdate() {
        this.$nextTick(function () {
            $('.selectpicker').selectpicker('refresh');
            $('.selectpicker').selectpicker({
                dropupAuto: false,
            });
        });
    },
    methods: {
        onChangeDriverFile(event){
            this.driverFile = event.target.files[0] ? event.target.files[0].name : DEFAULT_FILE_NAME;
        },
        onChangeSystemType: function (event) {
            this.resetData();
            this.selectedIndex = this.systemTypes.indexOf(event.target.value);
            this.viewConfig(this.selectedIndex + 1);
        },
        onChangeLimit: function (event) {
            this.limit = event.target.value;
        },

        getStatusList: function () {
            var _this = this;
            axios
                .get(migrationServer + '/user-migration/user-status')
                .then(function (response) {
                    if (response && response.data) {
                        _this.userStatusList = response.data.userStatusList;
                        _this.userStatusList.unshift(
                            { status: 'All', isChecked: false },
                            { status: 'NORMAL=0', isChecked: true }
                        );
                    }
                    _this.getSystemCodeList();
                })
                .catch(function (e) {
                    alert('업로드 중 에러 발생 : ' + e.message);
                    _this.userStatusList = [];
                    _this.getSystemCodeList();
                });
        },
        getSystemCodeList: function () {
            var _this = this;
            var data = {
                _type: 'GET',
                _url: contextPath + '/common/common/sysInfo',
                _data: null,
                _dataType: 'json',
                _async: false,
                _contentType: '',
            };
            var result = commonJs.callAjax(data);
            var originalList = result.data.list;
            originalList
                .filter(function (data) {
                    return data.sys_id_up === null;
                })
                .forEach(function (data) {
                    _this.systemCodeList.push({
                        sysId: data.sys_id,
                        sysName: data.sys_name,
                        isChecked: false,
                        subSystem: null,
                    });
                });
            var systemListL1Sub = [];
            var systemListL2Sub = [];
            var systemListL3Sub = [];
            originalList
                .filter(function (data) {
                    return data.sys_id_up !== null;
                })
                .forEach(function (data) {
                    systemListL1Sub.push({
                        sysId: data.sys_id,
                        sysIdUp: data.sys_id_up,
                        sysName: data.sys_name,
                        isChecked: false,
                        subSystem: null,
                        l1SysId: null,
                    });
                });
            var systemListSubGroup = _.chain(systemListL1Sub)
                .groupBy('sysIdUp')
                .map(function (value, key) {
                    return { sysIdUp: key, sysData: value };
                })
                .value();
            _this.buildSubList(
                systemListSubGroup,
                _this.systemCodeList,
                _this.systemListL2,
                systemListL2Sub
            );
            if (systemListL2Sub.length > 0) {
                _this.buildSubList(
                    systemListL2Sub,
                    _this.systemListL2,
                    _this.systemListL3,
                    systemListL3Sub
                );
            }
            this.viewConfig(1);
            // this.resetConnectionList();
        },
        buildSubList: function (
            listSubGroup,
            systemListParent,
            systemListChild,
            systemListChildSub
        ) {
            listSubGroup.forEach(function (item) {
                var temp = systemListParent.filter(function (l1) {
                    return l1.sysId === item.sysIdUp;
                });
                if (temp.length > 0) {
                    temp[0].subSystem = item.sysData;
                    systemListChild.push(...item.sysData);
                    systemListChild.forEach(function (child) {
                        child.l1SysId = temp[0].sysIdUp;
                    });
                } else {
                    systemListChildSub.push(item);
                }
            });
        },
        resetData: function () {
            this.isUpdateConfig = false;
            this.isUpdateFile = false;
            this.resetConnectionList();
            this.hasError = false;
        },
        resetConnectionList: function () {
            this.dbConnectionList = [
                {
                    id: null,
                    configurationName: null,
                    url: null,
                    username: null,
                    password: null,
                    query: null,
                    queryDescription: null,
                    connectResult: null,
                    systemType: null,
                    userStatus: null,
                    idPrefix: null,
                    systemCodes: null,
                    customColumns: null,
                    maxDept: null,
                    schedule: null,
                    driver: null,
                    driverPath: null,
                    filePath: null,
                    fileBackupPath: null,
                    systemCodeList: JSON.parse(
                        JSON.stringify(this.systemCodeList)
                    ),
                    systemListL2: JSON.parse(JSON.stringify(this.systemListL2)),
                    systemListL3: JSON.parse(JSON.stringify(this.systemListL3)),
                    userStatusList: JSON.parse(
                        JSON.stringify(this.userStatusList)
                    ),
                    expandedStatus: false,
                    expandedSystemCode: false,
                    selectedStatus: '1 status selected',
                    selectedSystemCode: '옵션을 선택하세요',
                    countSelectedSys: 0,
                },
            ];
        },
        checkStatus: function (connection, userStatus) {
            var statusTemp = '';
            connection.selectedStatus = '';
            if (userStatus.status === 'All') {
                if (userStatus.isChecked) {
                    connection.userStatusList.forEach(function (status) {
                        status.isChecked = true;
                    });
                    var size = connection.userStatusList.length - 1;
                    connection.selectedStatus = size + ' status selected';
                } else {
                    connection.userStatusList.forEach(function (status) {
                        if (status.status !== 'NORMAL=0') {
                            status.isChecked = false;
                        }
                    });
                    connection.selectedStatus = '1 status selected';
                }
            } else {
                connection.userStatusList[0].isChecked = false;
                connection.userStatusList
                    .filter(function (status) {
                        return status.isChecked;
                    })
                    .forEach(function (status) {
                        statusTemp = statusTemp + status.status + ',';
                    });
                connection.selectedStatus = statusTemp;
                if (connection.selectedStatus) {
                    connection.selectedStatus =
                        connection.selectedStatus.substring(
                            0,
                            connection.selectedStatus.length - 1
                        );
                    var size = connection.selectedStatus.split(',').length;
                    connection.selectedStatus = size + ' status selected';
                } else {
                    connection.selectedStatus = '1 status selected';
                }
            }
        },
        checkSystemCode: function (connection, systemCode) {
            this.selectedSystemCode = '';
            if (systemCode.sysId === 'allSys') {
                connection.systemCodeList.forEach(function (system) {
                    system.isChecked = systemCode.isChecked;
                    if (system.subSystem) {
                        system.subSystem.forEach(function (item) {
                            item.isChecked = systemCode.isChecked;
                            if (item.subSystem) {
                                item.subSystem.forEach(function (el) {
                                    el.isChecked = systemCode.isChecked;
                                });
                            }
                        });
                    }
                });
                connection.systemListL2.forEach(function (system) {
                    system.isChecked = systemCode.isChecked;
                });
                connection.systemListL3.forEach(function (system) {
                    system.isChecked = systemCode.isChecked;
                });

                var size = systemCode.isChecked
                    ? this.systemCodeList.length +
                      this.systemListL2.length +
                      this.systemListL3.length -
                      1
                    : 0;
                connection.selectedSystemCode = systemCode.isChecked
                    ? size + ' system code selected'
                    : '옵션을 선택하세요';
            } else {
                connection.systemCodeList[0].isChecked = false;
                connection.systemListL2
                    .filter(function (el) {
                        return el.sysId == systemCode.sysId;
                    })
                    .forEach(function (system) {
                        system.isChecked = systemCode.isChecked;
                    });
                connection.systemListL3
                    .filter(function (el) {
                        return el.sysId == systemCode.sysId;
                    })
                    .forEach(function (system) {
                        system.isChecked = systemCode.isChecked;
                    });
                if (systemCode.subSystem !== null) {
                    connection.countSelectedSys = systemCode.isChecked
                        ? +connection.countSelectedSys + 1
                        : +connection.countSelectedSys - 1;

                    connection.systemListL2
                        .filter(function (system) {
                            return system.sysIdUp === systemCode.sysId;
                        })
                        .forEach(function (system) {
                            if (system.isChecked && systemCode.isChecked) {
                                connection.countSelectedSys--;
                            }
                            system.isChecked = systemCode.isChecked;
                            connection.countSelectedSys = systemCode.isChecked
                                ? +connection.countSelectedSys + 1
                                : +connection.countSelectedSys - 1;
                        });
                    connection.systemListL3
                        .filter(function (system) {
                            return system.l1SysId === systemCode.sysId;
                        })
                        .forEach(function (system) {
                            if (system.isChecked && systemCode.isChecked) {
                                connection.countSelectedSys--;
                            }
                            system.isChecked = systemCode.isChecked;
                            connection.countSelectedSys = systemCode.isChecked
                                ? +connection.countSelectedSys + 1
                                : +connection.countSelectedSys - 1;
                        });
                    connection.systemListL3
                        .filter(function (system) {
                            return system.sysIdUp === systemCode.sysId;
                        })
                        .forEach(function (system) {
                            if (system.isChecked && systemCode.isChecked) {
                                connection.countSelectedSys--;
                            }
                            system.isChecked = systemCode.isChecked;
                            connection.countSelectedSys = systemCode.isChecked
                                ? +connection.countSelectedSys + 1
                                : +connection.countSelectedSys - 1;
                        });

                    systemCode.subSystem
                        .filter(function (system) {
                            return system.sysIdUp === systemCode.sysId;
                        })
                        .forEach(function (system) {
                            system.isChecked = systemCode.isChecked;
                            if (system.subSystem) {
                                system.subSystem.forEach(function (item) {
                                    item.isChecked = systemCode.isChecked;
                                });
                            }
                        });
                    if (connection.countSelectedSys <= 0) {
                        connection.selectedSystemCode = '옵션을 선택하세요';
                    } else {
                        connection.selectedSystemCode =
                            connection.countSelectedSys +
                            ' system code selected';
                    }
                } else {
                    if (systemCode.isChecked) {
                        connection.selectedSystemCode =
                            ++connection.countSelectedSys +
                            ' system code selected';
                    } else {
                        if (--connection.countSelectedSys <= 0) {
                            connection.selectedSystemCode = '옵션을 선택하세요';
                        } else {
                            connection.selectedSystemCode =
                                connection.countSelectedSys +
                                ' system code selected';
                        }
                    }
                }
            }
        },
        addNewDb: function () {
            this.hasError = false;
            this.dbConnectionList.push({
                id: null,
                configurationName: null, 
                url: null,
                username: null,
                password: null,
                query: null,
                queryDescription: null,
                connectResult: null,
                systemType: null,
                userStatus: null,
                idPrefix: null,
                systemCodes: null,
                customColumns: null,
                maxDept: null,
                schedule: null,
                driver: null,
                driverPath: null,
                filePath: null,
                fileBackupPath: null,
                systemCodeList: JSON.parse(JSON.stringify(this.systemCodeList)),
                systemListL2: JSON.parse(JSON.stringify(this.systemListL2)),
                systemListL3: JSON.parse(JSON.stringify(this.systemListL3)),
                userStatusList: JSON.parse(JSON.stringify(this.userStatusList)),
                expandedStatus: false,
                expandedSystemCode: false,
                selectedStatus: '1 status selected',
                selectedSystemCode: '옵션을 선택하세요',
                countSelectedSys: 0,
            });
        },
        removeDb: function (index) {
            this.hasError = false;
            this.dbConnectionList.splice(index, 1);
            if (this.dbConnectionList.length === 0) {
                this.addNewDb();
            }
        },

         //Testing the connection
        testConnection: function (connection) {
            if (this.isDisableButton(connection)) {
                return;
            }
            axios
                .post(migrationServer + '/user-migration/db-connection', {
                    url: connection.url,
                    username: CryptoJS.AES.encrypt(
                        connection.username,
                        secretKey
                    ).toString(),
                    password: CryptoJS.AES.encrypt(
                        connection.password,
                        secretKey
                    ).toString(),
                    driver: connection.driver,
                    driverPath: connection.driverPath,
                })
                .then(function (response) {
                    connection.connectResult = response.data;
                })
                .catch(function (e) {
                    alert('업로드 중 에러 발생 : ' + e.message);
                });
        },
        saveDbConfig: function (query, queryDescription, isCustomQuery) {
            var _this = this;
            var dbConnectionListClone = [];
            var filterError;
            this.hasError = false;
            this.dbConnectionList.forEach( (el) => {
                el.query = query;
                el.queryDescription = queryDescription;
                el.customQuery = isCustomQuery;
            })

            if (this.selectedIndex == 0) {
                filterError = this.dbConnectionList.filter(function (el) {
                    return (
                        !el.driver ||
                        !el.driverPath ||
                        !el.username ||
                        !el.password ||
                        !el.url ||
                        !el.idPrefix ||
                        !el.schedule ||
                        !el.query
                    );
                });
                if (filterError.length > 0) {
                    this.hasError = true;
                }
            } else {
                filterError = this.dbConnectionList.filter(function (el) {
                    return (
                        !el.filePath ||
                        !el.fileBackupPath ||
                        !el.idPrefix ||
                        !el.schedule
                    );
                });
                if (filterError.length > 0) {
                    this.hasError = true;
                }
            }
            if (!this.hasError) {
                this.dbConnectionList.forEach(function (item) {
                    dbConnectionListClone.push(_this.buildDataClone(item));
                });

                if (this.isUpdateConfig) {
                    // const body = dbConnectionListClone[0];
                   
                    var body = dbConnectionListClone[0];
                    axios
                        .put(
                            migrationServer +
                                '/user-migration/opuser-config/' +
                                body.id,
                            body
                        )
                        .then(function (response) {
                            alert('구성 업데이트 성공');
                            _this.viewConfig(+_this.selectedIndex + 1);
                            _this.isUpdateConfig = false;
                            _this.steps.forEach( (step) => {
                                step.isCompleted = false;
                                step.isActive = false
                            });
                            _this.steps[0].isActive = true;
                            _this.driverFile = '';
                        })
                        .catch(function (e) {
                            alert('업로드 중 에러 발생 : ' + e.message);
                        });
                } else {
                    if (this.selectedIndex === 0) {
                        dbConnectionListClone = dbConnectionListClone.filter(
                            function (item) {
                                return (
                                    item.connectResult === 'Success' &&
                                    item.query
                                );
                            }
                        );
                    }
                    if (dbConnectionListClone.length === 0) {
                        alert('시스템 데이터는 비워둘 수 없습니다');
                    } else {
                        axios
                            .post(
                                migrationServer +
                                    '/user-migration/opuser-config',
                                {
                                    migrationConfigurationDTOS:
                                        dbConnectionListClone,
                                }
                            )
                            .then(function (response) {
                                alert(configStored_msg);
                                _this.viewConfig(+_this.selectedIndex + 1);
                                _this.isUpdateConfig = false;
                                _this.steps.forEach( (step) => {
                                    step.isCompleted = false;
                                    step.isActive = false
                                });
                                _this.steps[0].isActive = true;
                                _this.driverFile = '';
                            })
                            .catch(function (e) {
                                alert('업로드 중 에러 발생 : ' + e.message);
                            });
                    }
                }
            } else {
                alert('모든 필수 필드를 작성하십시오.');
            }
        },
        viewConfig: function (systemType) {
            var _this = this;
            this.isExistConfig = true;
            this.hasError = false;
            axios
                .get(migrationServer + '/user-migration/opuser-config', {
                    params: {
                        systemType: systemType,
                    },
                })
                .then(function (response) {
                    const responseData =
                        response.data.migrationConfigurationDTOS;
                    if (responseData.length > 0) {
                        responseData.forEach(function (item) {
                            if (item.username && item.password) {
                                item.username = CryptoJS.AES.decrypt(
                                    item.username,
                                    secretKey
                                ).toString(CryptoJS.enc.Utf8);
                                item.password = CryptoJS.AES.decrypt(
                                    item.password,
                                    secretKey
                                ).toString(CryptoJS.enc.Utf8);
                            }
                            item.systemCodeList = JSON.parse(
                                JSON.stringify(_this.systemCodeList)
                            );
                            item.userStatusList = JSON.parse(
                                JSON.stringify(_this.userStatusList)
                            );
                            item.systemListL2 = JSON.parse(
                                JSON.stringify(_this.systemListL2)
                            );
                            item.systemListL3 = JSON.parse(
                                JSON.stringify(_this.systemListL3)
                            );
                            item.userStatusList = JSON.parse(
                                JSON.stringify(_this.userStatusList)
                            );
                            item.countSelectedSys = 0;
                        });
                        _this.dbConnectionList = responseData;
                        _this.isExistConfig = true;
                    } else {
                        _this.isExistConfig = false;
                        _this.resetConnectionList();
                    }
                    _this.$nextTick(function () {
                        $('.selectpicker').selectpicker('refresh');
                        $('.selectpicker').selectpicker({
                            dropupAuto: false,
                        });
                    });
                    _this.queryBuilderProp = JSON.parse(DEFAULT_QUERY_BUILDER_PROP);
                    _this.createWatcher();
                })
                .catch(function (e) {
                    alert('업로드 중 에러 발생 : ' + e.message);
                    _this.isExistConfig = false;
                });
            this.isCustomColumnsCorrect = true;
        },
        addNewConfig: function () {
            
            this.isExistConfig = false;
            this.isUpdateConfig = false;
            this.hasError = false;
            this.resetConnectionList();
            this.driverFile = DEFAULT_FILE_NAME;
            // this.createWatcher();
        },

         //Disable the testing button
        isDisableButton: function (connection) {
            return (
                !connection.driver ||
                !connection.driverPath ||
                !connection.username ||
                !connection.password ||
                !connection.url
            );
        },
        getDriveFileName(connection) {
            return connection.driverPath ? /([\\\/])(?:[^\\\/])+\.[^\\\/]+$/.exec(connection.driverPath)[0].replace(/([\\\/])(?:[^\\\/])+\.[^\\\/]+$/.exec(connection.driverPath)[1], '') : DEFAULT_FILE_NAME

        },
        editConfig: function (connection, isFileMigration) {
            
            this.driverFile = this.getDriveFileName(connection);
            this.isExistConfig = false;
            this.isUpdateFile = isFileMigration;
            this.isUpdateConfig = true;
            // this.queryBuilderProp.isCustomQuery = connection.customQuery
            this.hasError = false;
            var _this = this;
            if (connection.userStatus) {
                connection.userStatus.split(',').forEach(function (stt) {
                    connection.userStatusList
                        .filter(function (el) {
                            return el.status === stt;
                        })
                        .forEach(function (el) {
                            el.isChecked = true;
                        });
                });
            }
            if (connection.systemCodes) {
                connection.systemCodes.split(',').forEach(function (sys) {
                    connection.systemCodeList.every(function (el) {
                        if (el.sysId === sys) {
                            el.isChecked = true;
                            connection.countSelectedSys++;
                            return false;
                        }
                        if (el.subSystem !== null) {
                            el.subSystem.every(function (item) {
                                if (item.sysId === sys) {
                                    item.isChecked = true;
                                    connection.countSelectedSys++;
                                    return false;
                                }
                                if (item.subSystem !== null) {
                                    item.subSystem.every(function (item) {
                                        if (item.sysId === sys) {
                                            item.isChecked = true;
                                            connection.countSelectedSys++;
                                            return false;
                                        }
                                        return true;
                                    });
                                }
                                return true;
                            });
                        }
                        return true;
                    });
                    _this.findSysCodeInList(connection.systemListL2, sys);
                    _this.findSysCodeInList(connection.systemListL3, sys);
                });
            }

            this.dbConnectionList = [
                {
                    id: connection.id,
                    configurationName: connection.configurationName,
                    url: connection.url,
                    username: connection.username,
                    password: connection.password,
                    customQuery: connection.customQuery,
                    query: connection.query,
                    queryDescription: connection.queryDescription,
                    connectResult: null,
                    systemType: connection.systemType,
                    userStatus: connection.userStatus,
                    idPrefix: connection.idPrefix,
                    systemCodes: connection.systemCodes,
                    customColumns: connection.customColumns,
                    maxDept: connection.maxDept,
                    schedule: connection.schedule,
                    driver: connection.driver,
                    driverPath: connection.driverPath,
                    systemCodeList: connection.systemCodeList,
                    systemListL2: connection.systemListL2,
                    systemListL3: connection.systemListL3,
                    userStatusList: connection.userStatusList,
                    filePath: connection.filePath,
                    fileBackupPath: connection.fileBackupPath,
                    expandedStatus: false,
                    expandedSystemCode: false,
                    selectedStatus:
                        connection.userStatus || '1 status selected',
                    selectedSystemCode:
                        connection.countSelectedSys !== 0
                            ? connection.countSelectedSys +
                              ' system code selected'
                            : '옵션을 선택하세요',
                    countSelectedSys: connection.countSelectedSys,
                },
            ];

            // this.createWatcher();
        },
        findSysCodeInList: function (list, systemCode) {
            list.every(function (item) {
                if (item.sysId === systemCode) {
                    item.isChecked = true;
                    return false;
                }
                return true;
            });
        },
        deleteConfig: function (configId) {
            deleteConfirmPopup.$data.configId = configId;
            deleteConfirmPopup.$data.systemType = +this.selectedIndex + 1;
            $('#deleteConfirmPopup').modal('show');
        },
        disableConfig: function (configId) {
            disableConfirmPopup.$data.configId = configId;
            disableConfirmPopup.$data.systemType = +this.selectedIndex + 1;
            $('#disableConfirmPopup').modal('show');
        },
        //Function enable config
        enableConfig: function (configId) {
            var systemType = +this.selectedIndex + 1;
            var migrationUrl = migrationServer + 
                '/user-migration/opuser-config/disable/' 
                + configId;
            console.log(migrationUrl);
            axios
                .put(migrationUrl)
                .then(function (response) {
                    //Disable configuration successfully | 구성을 성공적으로 비활성화
                    alert(configEnabled_msg);
                    userMigration.viewConfig(systemType);
                })
                .catch(function (e) {
                    //Unexpected error occurred | 예기치 않은 오류 발생:
                    alert('Unexpected error occurred: ' + e.message);
                });
        },

        cancelAction: function (systemType) {
            var _this = this;
            this.showModalConfirmation(cancelStep_msg).then(() => {
                // console.log("User confirmed!");
                _this.hasError = false;
                if (systemType) {
                    _this.viewConfig(systemType);
                } else {
                    _this.viewConfig(1);
                };
                _this.queryBuilderProp = JSON.parse(DEFAULT_QUERY_BUILDER_PROP);
              }).catch(err => {
                // console.log("User cancelled!", err);
                    return;
              });
        },
        openConfigIntroModal: function () {
            configIntroModal.$data.option = +this.selectedIndex + 1;
            $('#configIntro').modal('show');
        },
        showStatus: function (connection, index) {
            var userStatusEl = document.getElementById('userStatus' + index);
            // if (connection.expandedStatus === false) {
            //     userStatusEl.style.display = 'block';
            //     connection.expandedStatus = true;
            // } else {
            //     userStatusEl.style.display = 'none';
            //     connection.expandedStatus = false;
            // }
            var dropdownEl = document.getElementById('status-dropdown' + index);
            var overSelect = document.getElementById('over-select-status');
            userStatusEl.style.display = userStatusEl.style.display === 'block' ? 'none': 'block';
            // document.addEventListener('click', function (event) {
            //     var isClickInside =
            //         userStatusEl.contains(event.target) ||
            //         dropdownEl.contains(event.target) || 
            //         overSelect.contains(event.target);

            //     if (!isClickInside && connection.expandedStatus) {
            //         userStatusEl.style.display = 'none';
            //         connection.expandedStatus = false;
            //     }
            // });
        },
        showSystemCode: function (connection, index) {
            var systemCodeEl = document.getElementById('systemCode' + index);
            // if (connection.expandedSystemCode === false) {
            //     systemCodeEl.style.display = 'block';
            //     connection.expandedSystemCode = true;
            // } else {
            //     systemCodeEl.style.display = 'none';
            //     connection.expandedSystemCode = false;
            // }

            var dropdownEl = document.getElementById(
                'systemcode-dropdown' + index
            );
            var overSelect = document.getElementById('over-select-system');
            systemCodeEl.style.display = systemCodeEl.style.display === 'block' ? 'none': 'block';
            // document.addEventListener('click', function (event) {
            //     var isClickInside = dropdownEl.contains(event.target) || overSelect.contains(event.target);

            //     if (!isClickInside && connection.expandedSystemCode) {
            //         systemCodeEl.style.display = 'none';
            //         connection.expandedSystemCode = false;
            //     }
            // });

            var detailParent = document.getElementsByClassName('detail-parent');
            Array.from(detailParent).forEach(function (el) {
                el.addEventListener('click', function (event) {
                    event.stopImmediatePropagation();
                    const selector =
                        this.parentElement.querySelector('.detail-nested');
                    if (selector) {
                        selector.classList.toggle('detail-active');
                    }
                    this.classList.toggle('detail-click');
                });
            });
        },
        getOpuserColumns() {
            var _this = this;
            axios
                .get(contextPath + '/opusers/columns')
                .then(function (response) {
                    if (response.data) {
                        // queryBuilderModal.$data.opuserColumns =
                        //     response.data.columns;
                        // _this.queryBuilderProp.opuserColumns = [];
                    }
                })
                .catch(function (e) {
                    alert('업로드 중 에러 발생 : ' + e.message);
                });
        },
        getDbInfo: function (connection) {
            var _this = this;
            var queryBuilderProp;
            var connectionClone = this.buildDataClone(connection);
            axios
                .post(migrationServer + '/customer-db/schemas', connectionClone)
                .then(function (response) {
                    //if query of config is customized then queryBuilderProp will be set to default so no table rendering will be available -> Is it necessary?
                    queryBuilderProp = JSON.stringify(_this.queryBuilderProp);
                    //new session
                    if (queryBuilderProp === DEFAULT_QUERY_BUILDER_PROP) {

                        // _this.queryBuilderProp.query = connection.query ? connection.query : '';
                        if (connection.query) {
                            _this.queryBuilderProp.query = connection.customColumns ? _this.alterQueryWithCustomColumns(connection.query, connection.customColumns) : connection.query;
                        } else{
                            // _this.queryBuilderProp.query = connection.customColumns ? "SELECT " + connection.customColumns : '';                           
                            _this.queryBuilderProp.query = '';
                        }
                        // first time view from db load query_description
                        _this.queryBuilderProp.query_description = connection.queryDescription ? JSON.parse(JSON.stringify(connection.queryDescription)) : null;
                        _this.queryBuilderProp.isCustomQuery = connection.customQuery;
                    }
                    else {
                        _this.queryBuilderProp.query = _this.alterQueryWithCustomColumns(_this.queryBuilderProp.query, connection.customColumns, _this.queryBuilderProp.lastCustomColumns)
                    }
                    _this.queryBuilderProp.schemas = response.data.schemas[0] ? response.data.schemas : [connection.url.match(/\/([^\/]+)$/)[1]];
                    _this.queryBuilderProp.opUserConfig = connection;
                    _this.steps[2].isActive = true;
                    // $('#queryBuilder').modal({backdrop: "static"});
                })
                .catch(function (e) {
                    alert('업로드 중 에러 발생 : ' + e.message);
                });
          
        },
        alterQueryWithCustomColumns(query, addedColumns, deletedColumns) { 
            // if (!deletedColumns) {deletedColumns = '';}
            var formattedSql;
            var sql_before_replace;
            var sql_after_replace;
            const regex_column_deleted = new RegExp(deletedColumns + ',', 'ig');
            if (!query) {
                return '';
            }
            if (!addedColumns) {
                addedColumns = '';
            }
            let oldQuery = query.replace(/\n/g, ' ').replace(/\s+/g, ' ');

            if (deletedColumns) {
                formattedSql = oldQuery.replace('SELECT ', '').replace(regex_column_deleted, '');
            } else {
                // if (oldQuery.startsWith('SELECT ,')) {
                //     formattedSql = oldQuery.replace('SELECT ,', '');
                // } else {
                //     formattedSql = oldQuery.replace('SELECT ', ',');
                // }
                formattedSql = oldQuery.replace('SELECT ', '');
                
            }
            if (addedColumns) {
                // sql_after_replace = sql_before_replace.replace(regex_column_added, addedColumns + ',');
                sql_before_replace = "SELECT " + addedColumns + "," + formattedSql;
                let selectRemoved = sql_before_replace.replace(/^SELECT\s/i, "");
                let splitQuery = selectRemoved.split(',');
                let uniqueQueryParts = [...new Set(splitQuery)];
                sql_after_replace = "SELECT " + uniqueQueryParts.join(",");
            } else {
                sql_after_replace = "SELECT " + addedColumns + formattedSql
            }
            return sql_after_replace;

        },
        showCronModal: function(connection) {
  
            cronModal.$data.opUserConfig = connection;
            $('#cronModal').modal('show');

        },
        executeQuery: function (connection) {
            var connectionClone = this.buildDataClone(connection);
            connectionClone.queryLimit = this.limit;
            axios
                .post(
                    migrationServer + '/customer-db/test-query',
                    connectionClone
                )
                .then(function (response) {
                    if (response.data.success) {
                        queryResultModal.$data.resultData = response.data;
                        $('#queryResult').modal('show');
                    } else {
                        alert('Cannot execute query!');
                    }
                })
                .catch(function (e) {
                    alert('업로드 중 에러 발생 : ' + e.message);
                });
        },
         //Run the job
        runJob: function (connection, isFileMigration) {
            var _this = this;
            this.hasError = isFileMigration ?
                (!connection.filePath ||
                !connection.fileBackupPath ||
                !connection.idPrefix ||
                !connection.schedule) :
                (!connection.idPrefix || !connection.schedule || !connection.query)
            if (!this.hasError) {
                var connectionClone = this.buildDataClone(connection);
                // connectionClone.query = queryBuilderModal.formatBackQuery(connection.query);
                var url = isFileMigration
                    ? '/user-migration/job-file'
                    : '/user-migration/job';
                axios
                    .post(migrationServer + url, connectionClone)
                    .then(function (response) {
                        if (response.data.status === 'FAILED') {
                            jobErrorModal.$data.message = response.data.message;
                            $('#jobError').modal('show');
                        } else {

                            var opUserJobStatistic = response.data.opUserJobStatistic;
                            if (opUserJobStatistic) {
                                var startTimeStr = opUserJobStatistic.jobStartTime;
                                var finishTimeStr = opUserJobStatistic.jobFinishedTime;
                                const jobStartTime = new Date(startTimeStr);
                                                
                                const jobFinishedTime = new Date(finishTimeStr);                
                                const diffMs = jobFinishedTime - jobStartTime; // difference in milliseconds
                                // Convert to seconds
                                const diffSeconds = diffMs / 1000;

                                var operationDetail = response.data.opUserJobStatistic.operationDetail;

                                if (operationDetail) {
                                    var message = "";

                                    message += "Status: " + response.data.status + "\n";
                                    message += "Time executed: " + diffSeconds + " seconds" + "\n";
                                    message += "\n";

                                    for (const tableName in operationDetail) {
                                        if (Object.hasOwn(operationDetail, tableName)) {
                                            message += "Table: " + tableName + "\n";
                                            message += "\tNumber of inserted record: " + operationDetail[tableName].insertedCount + "\n";
                                            message += "\tNumber of updated record: " + operationDetail[tableName].updatedCount + "\n";
                                            message += "\n";
                                        }
                                    };
                                    alert(message);
                                    _this.$refs.queryBuilder[0].isEnableSaveConfig = true;
                                } else { 
                                    alert('Where is my operationDetail?'); 
                                }
                            } else { 
                                alert('Where is my opUserJobStatistic?'); 
                            }
                        }
                    })
                    .catch(function (e) {
                        alert('업로드 중 에러 발생 : ' + e.message);
                    });
            } else {
                alert('모든 필수 필드를 작성하십시오.');
            }
        },
        buildDataClone: function (connection) {
            var connectionClone = JSON.parse(JSON.stringify(connection));
            connectionClone.username = CryptoJS.AES.encrypt(
                connectionClone.username,
                secretKey
            ).toString();
            connectionClone.password = CryptoJS.AES.encrypt(
                connectionClone.password,
                secretKey
            ).toString();
            connectionClone.systemType = +this.selectedIndex + 1;
            connectionClone.userStatus = connectionClone.userStatusList
                .filter(function (statusEl) {
                    return statusEl.isChecked && statusEl.status !== 'All';
                })
                .map(function (statusEl) {
                    return statusEl.status;
                })
                .join(',');
            var sysL1 = connectionClone.systemCodeList
                .filter(function (sysEl) {
                    return sysEl.isChecked;
                })
                .map(function (sysEl) {
                    return sysEl.sysId;
                })
                .join(',');
            var sysL2 = '';
            var sysL3 = '';
            connectionClone.systemCodeList.forEach(function (sys) {
                if (sys.subSystem !== null) {
                    sys.subSystem.forEach(function (l2) {
                        if (l2.isChecked) {
                            sysL2 += l2.sysId + ',';
                        }
                        if (l2.subSystem !== null) {
                            var sysL3Temp = l2.subSystem
                                .filter(function (l3) {
                                    return l3.isChecked;
                                })
                                .map(function (l3) {
                                    return l3.sysId;
                                })
                                .join(',');
                            if (!!sysL3Temp) {
                                sysL3 += sysL3Temp + ',';
                            }
                        }
                    });
                }
            });
            connectionClone.systemCodes = [
                sysL1,
                sysL2.slice(0, -1),
                sysL3.slice(0, -1),
            ]
                .filter(function (val) {
                    return !!val;
                })
                .join(',');
            return connectionClone;
        },
        onChangeDriver: function (event, connection) {
            var selectedDriver = event.target.value;
            const DbMapping = {
                Postgres: 'org.postgresql.Driver',
                Oracle: 'oracle.jdbc.OracleDriver',
                MySQL: 'com.mysql.jdbc.Driver',
                Sybase: 'com.sybase.jdbc.SybDriver',
                SQLServer:'com.microsoft.sqlserver.jdbc.SQLServerDriver'
            }
            if (selectedDriver == 'Other') {
                $('.editOption').val('');
                $('.editOption').show();
                $('.editOption').attr(
                    'placeholder',
                    'Example: org.postgresql.Driver'
                );
            } else {
                $('.editOption').hide();
                connection.driver = DbMapping[selectedDriver];
                // switch (selectedDriver) {
                //     case 'Postgres':
                //         connection.driver = 'org.postgresql.Driver';
                //         break;
                //     case 'Oracle':
                //         connection.driver = 'oracle.jdbc.driver.OracleDriver';
                //         break;
                //     case 'MySQL':
                //         connection.driver = 'com.mysql.jdbc.Driver';
                //         break;
                //     case 'Sybase':
                //         connection.driver = 'com.sybase.jdbc.SybDriver';
                //         break;
                //     default:
                //         break;
                // }
            }
            this.queryBuilderProp.dbType = selectedDriver;
        },
        async chooseDriver(connection) {
            var _this = this;
            const fileInput = this.$refs.fileInput;
            if (!fileInput[0].files.length) {
              alert('Please select a file');
              return;
            }
    
            const file = fileInput[0].files[0];
            const formData = new FormData();
            formData.append('file', file);
            if (file.size > 33554432) {
                alert ('Uploaded file exceeded size limit: 32MB');
                return;
            }
            try {
                const response = await axios.post(migrationServer + '/customer-db/upload-driver', formData, {
                    headers: { 'Content-Type': 'multipart/form-data' },
                }).then( (res) => {
                    _this.result.responseCode = res.status;
                    _this.result.responseText = res.data.message;
                    connection.driverPath = res.data.upload_dir;
                
                } ).catch((error) => {
                    _this.result.responseCode = error.response.status;
                    _this.result.responseText = error.response.data.message;
                    connection.driverPath = error.response.data.upload_dir; 
                });
                alert(this.result.responseText);
              
            } catch (error) {
              console.error('Failed to upload file:', error);
            }
        },
        showModalConfirmation: function(alertContent) {
            return new Promise((resolve, reject) => {
            //   let confirmModal = $('#confirmModal');
              let confirmBtn = $('#modalConfirmBtn');
              let cancelBtn = $('#modalCancelBtn');
              confirmModal.$data.message = alertContent;

              $('#confirmModal').modal('show');
      
              confirmBtn.one('click', function() {
                resolve(true);
                $('#confirmModal').modal('hide');
              });
              cancelBtn.one('click', function() {
                reject(new Error('User cancelled'));
                $('#confirmModal').modal('hide');
              });
            });
        },
        changeStepHelper(index, connection) {
            for (let i = index; i < this.steps.length; i++ ) {
                this.steps[i].isCompleted = false;
            }

            index > 0 ? this.steps[index-1].isCompleted = true : null;
            
            this.steps.forEach((step) => {
                step.isActive = false;
            })

            index === 2 ? this.getDbInfo(connection) : this.steps[index].isActive = true;
        },
        changeStep(index, connection, isEmitted) {
            // index > 0 ? this.steps[index-1].isCompleted = true : null;
            if (!this.isCustomColumnsCorrect) {
                alert('Please select custom column in correct format');
                return;
            }
            var _this = this;
            let currentIndex = this.steps.findIndex(step => step.isActive);

            if (currentIndex === 2 ) {
                
                if (this.$refs.queryBuilder[0].isCustomQuery) {
                    this.showModalConfirmation(changeStepEnableEdit_msg).then(() => {
                        if (isEmitted) {
                            _this.changeStepHelper(index, connection);
                        } else {
                            _this.queryBuilderProp.query = _this.$refs.queryBuilder[0].query
                            _this.queryBuilderProp.lastCustomColumns = _this.$refs.queryBuilder[0].opUserConfig.customColumns;
                            _this.queryBuilderProp.query_description = !_this.$refs.queryBuilder[0].isCustomQuery ? _this.$refs.queryBuilder[0].query_description : null;
                            _this.queryBuilderProp.isCustomQuery = _this.$refs.queryBuilder[0].isCustomQuery;
                            _this.changeStepHelper(index, connection);
                        }
                    }).catch((err) => {
                        console.error(err);
                    })
                } else {
                    if (isEmitted) {
                        _this.changeStepHelper(index, connection);
                    } else {
                        _this.queryBuilderProp.query = _this.$refs.queryBuilder[0].query
                        _this.queryBuilderProp.lastCustomColumns = _this.$refs.queryBuilder[0].opUserConfig.customColumns;
                        _this.queryBuilderProp.query_description = !_this.$refs.queryBuilder[0].isCustomQuery ? _this.$refs.queryBuilder[0].query_description : null;
                        _this.queryBuilderProp.isCustomQuery = _this.$refs.queryBuilder[0].isCustomQuery;
                        _this.changeStepHelper(index, connection);
                    }                    
                }
            }
            
            else {

                if ((index > currentIndex) && !this.isUpdateConfig) {
                    if (index === currentIndex + 1) {
                        //allow execution
                        if (index === 1 && !connection.configurationName) {

                            alert(emptyConfigName_msg);
                            return;
                            
                        }
                        if (index === 1 && connection.connectResult !== 'Success') {

                            alert(testConnection_msg);
                            return;
                            
                        } 
                        if (index === 2 && !connection.idPrefix || index === 2 && !connection.schedule) {
                            alert(emptyIdSchedule_msg);
                            return;
                        }
                    } else {
                        alert(stepNotComplete_msg);
                        return;
                    }
                } else if ((index > currentIndex) && this.isUpdateConfig) {
                    if (index === currentIndex + 1) {
                        //allow execution
                        if (index === 1 && !connection.configurationName) {

                            alert(emptyConfigName_msg);
                            return;
                            
                        }
                    }
                }

                // if (currentIndex === 2 && !confirm('You will lose query process if you go back')) {
                //     return;
                // }
                _this.changeStepHelper(index, connection);
            }
        },
        createWatcher() {
            var _this = this;
            // this.$watch(
            //     () => _this.dbConnectionList[0].customColumns,
            //     function (newVal) {
            //         if (_this.isExistConfig || !newVal){
            //             _this.isCustomColumnsCorrect = true;
            //             return;
            //         }
            //         if (!/^\s*(?:\w+\.\w+\.\w+\s+AS\s+\w+\s*,\s*)*(?:\w+\.\w+\.\w+\s+AS\s+\w+)\s*$|^\s*$/i.test(newVal)) {
            //             _this.isCustomColumnsCorrect = false;
            //         } else {
            //             _this.isCustomColumnsCorrect = true;
            //         }
            //     },
              
            // );
            this.$watch(
                () => _this.dbConnectionList[0].url,
                function (newVal) {
                    if (newVal && _this.dbConnectionList[0].connectResult) {
                        _this.dbConnectionList[0].connectResult = 'Failed'
                    }
                },
              
            );
            // this.$watch(
            //     () => _this.steps[1].isActive,
            //     function (newVal) {
            //         if (newVal) {
            //             _this.getStatusList(false);
            //         }
            //     },
            // );           
        }
    },

});

var deleteConfirmPopup = new Vue({
    el: '#deleteConfirmPopup',
    data: function () {
        return {
            configId: null,
            systemType: null,
        };
    },
    methods: {
        deleteConfig: function () {
            var _this = this;
            axios
                .delete(
                    migrationServer +
                        '/user-migration/opuser-config/' +
                        this.configId
                )
                .then(function (response) {
                    alert('구성 삭제 성공');
                    $('#deleteConfirmPopup').modal('hide');
                    userMigration.$data.steps.forEach( (step) => {
                        step.isCompleted = false;
                        step.isActive = false
                    });
                    userMigration.$data.steps[0].isActive = true;
                    userMigration.$data.isUpdateConfig = false;
                    userMigration.$data.driverFile = '';
                    userMigration.viewConfig(_this.systemType);
                })
                .catch(function (e) {
                    alert('업로드 중 에러 발생 : ' + e.message);
                });
        },
    },
});

var queryResultModal = new Vue({
    el: '#queryResult',
    data: function () {
        return {
            resultData: null,
        };
    },
});
var disableConfirmPopup = new Vue({
    el: '#disableConfirmPopup',
    data: function () {
        return {
            configId: null,
            systemType: null,
        };
    },
    methods: {
        disableConfig: function () {
            var _this = this;
            var migrationUrl = migrationServer + 
                '/user-migration/opuser-config/disable/' 
                + this.configId;
            console.log(migrationUrl);
            axios
                .put(migrationUrl)
                .then(function (response) {
                    //Disable configuration successfully | 구성을 성공적으로 비활성화
                    alert(configDisabled_msg);
                    $('#disableConfirmPopup').modal('hide');
                    userMigration.viewConfig(_this.systemType);
                })
                .catch(function (e) {
                    //Unexpected error occurred | 예기치 않은 오류 발생:
                    alert('Unexpected error occurred: ' + e.message);
                });
        },
    },
});

var configIntroModal = new Vue({
    el: '#configIntro',
    data: function () {
        return {
            option: null,
        };
    },
});


var databaseInfoModal = new Vue({
    el: '#databaseInfo',
    data: function () {
        return {
            schemas: null,
            tables: null,
            columns: null,
            opUserConfig: null,
            schemaIndex: null,
            tableIndex: null,
        };
    },
    methods: {
        cloneData: function () {
            var connectionClone = JSON.parse(JSON.stringify(this.opUserConfig));
            connectionClone.username = CryptoJS.AES.encrypt(
                connectionClone.username,
                secretKey
            ).toString();
            connectionClone.password = CryptoJS.AES.encrypt(
                connectionClone.password,
                secretKey
            ).toString();
            return connectionClone;
        },
        showTables: function (schema, index) {
            var _this = this;
            var connectionClone = this.cloneData(this.opUserConfig);
            connectionClone.schemaName = schema;
            this.tableIndex = null;
            if (this.schemaIndex === index) {
                if (this.tables) {
                    this.tables = null;
                } else {
                    axios
                        .post(
                            migrationServer + '/customer-db/tables',
                            connectionClone
                        )
                        .then(function (response) {
                            _this.tables = response.data.tables;
                        })
                        .catch(function (e) {
                            alert('업로드 중 에러 발생 : ' + e.message);
                        });
                }
            } else {
                this.tables = null;
                if (this.schemaIndex != null) {
                    var detailParentPre =
                        document.getElementsByClassName('parent-info')[
                            this.schemaIndex
                        ];
                    const selector =
                        detailParentPre.parentElement.querySelector(
                            '.detail-nested'
                        );
                    if (selector) {
                        selector.classList.remove('detail-active');
                    }
                    detailParentPre.classList.remove('info-click');
                }
                this.schemaIndex = index;
                axios
                    .post(
                        migrationServer + '/customer-db/tables',
                        connectionClone
                    )
                    .then(function (response) {
                        _this.tables = response.data.tables;
                    })
                    .catch(function (e) {
                        alert('업로드 중 에러 발생 : ' + e.message);
                    });
            }
            var detailParent =
                document.getElementsByClassName('parent-info')[index];
            const selector =
                detailParent.parentElement.querySelector('.detail-nested');
            if (selector) {
                selector.classList.toggle('detail-active');
            }
            detailParent.classList.toggle('info-click');
        },
        showColumns: function (schema, table, index, idx) {
            var _this = this;
            var connectionClone = this.cloneData(this.opUserConfig);
            connectionClone.schemaName = schema;
            connectionClone.tableName = table;
            if (this.tableIndex === idx) {
                if (this.columns) {
                    this.columns = null;
                } else {
                    axios
                        .post(
                            migrationServer + '/customer-db/columns',
                            connectionClone
                        )
                        .then(function (response) {
                            _this.columns = response.data.columns;
                        })
                        .catch(function (e) {
                            alert('업로드 중 에러 발생 : ' + e.message);
                        });
                }
            } else {
                this.columns = null;
                if (this.tableIndex != null) {
                    var detailParentPre = document.getElementsByClassName(
                        'column-' + index
                    )[this.tableIndex];
                    const selector =
                        detailParentPre.parentElement.querySelector(
                            '.detail-nested'
                        );
                    if (selector) {
                        selector.classList.remove('detail-active');
                    }
                    detailParentPre.classList.remove('info-click');
                }
                this.tableIndex = idx;
                axios
                    .post(
                        migrationServer + '/customer-db/columns',
                        connectionClone
                    )
                    .then(function (response) {
                        _this.columns = response.data.columns;
                    })
                    .catch(function (e) {
                        alert('업로드 중 에러 발생 : ' + e.message);
                    });
            }

            var columnParent = document.getElementsByClassName(
                'column-' + index
            )[idx];
            const selector =
                columnParent.parentElement.querySelector('.detail-nested');
            if (selector) {
                selector.classList.toggle('detail-active');
            }
            columnParent.classList.toggle('info-click');
        },
        closeModal: function () {
            this.schemaIndex = null;
            this.tableIndex = null;
            var detailParent = document.getElementsByClassName('parent-info');
            if (detailParent) {
                Array.from(detailParent).forEach(function (el) {
                    const selector =
                        el.parentElement.querySelector('.detail-nested');
                    if (selector) {
                        selector.classList.remove('detail-active');
                    }
                    el.classList.remove('info-click');
                });
            }
            var columnParent = document.getElementsByClassName('column-info');
            if (columnParent) {
                Array.from(columnParent).forEach(function (el) {
                    const element =
                        el.parentElement.querySelector('.detail-nested');
                    if (element) {
                        element.classList.remove('detail-active');
                    }
                    el.classList.remove('info-click');
                });
            }
        },
    },
});

var jobErrorModal = new Vue({
    el: '#jobError',
    data: function () {
        return {
            message: null,
        };
    },
});

var confirmModal = new Vue({
    el: '#confirmModal',
    data: function () {
        return {
            message: null,
        };
    },
});

var tutorialModal = new Vue({
    el: '#systemOption',
    data: function() {
        return {
            systemTypes: ['DB연동', '파일연동'],
            tab1Selected: true,
            tab2Selected: false,
            // slideIndex: 1
            slideIndex: 0
        }
    },
    mounted() {
        this.showDivs(this.slideIndex);
    },
    updated() {
        $('.description-slides').css('display', 'none');
        $('.description-slides').eq(this.slideIndex).css('display', 'block');
    },
    methods: {
        plusDivs(n) {
            this.showDivs(this.slideIndex += n);
        },
        showDivs(n) {
            if (n > $('.description-slides').length - 1) {
                this.slideIndex = 0;
            }
            if (n < 0) { 
                this.slideIndex = $('.description-slides').length - 1;
            } 

            $('.description-slides').css('display', 'none');
            $('.description-slides').eq(this.slideIndex).css('display', 'block');

        },
        selectTab(event, tab) {
            event.preventDefault();
            if (tab === 'tab01') {
                this.slideIndex = 0;
                this.tab1Selected = true;
                this.tab2Selected = false;
                this.showDivs(0);
            } else if(tab === 'tab02') {
                this.slideIndex = 0;
                this.tab2Selected = true;
                this.tab1Selected = false;
                this.showDivs(0);
            }
        },
    }
});

var cronModal = new Vue({
    el: '#cronModal',
    data: function() {
        return {
            fieldSelected: {
                minuteSelected: true,
                hourSelected: false,
                dateOfMonthSelected: false,
                monthSelected: false,
                dateOfWeekSelected: false,
            },
            minuteInput: '',
            hourInput: '',
            dateOfMonthInput: '',
            monthInput: '',
            dateOfWeekInput: [],
            cronArray: ['', '', '', '', ''],
            cronBasicGenerated: '',
            cronQuartzGenerated: '',
            userPrompt : {
                minutePrompt: false,
                hourPrompt: false,
                dateOfMonthPrompt: false,
                monthPrompt: false,
                dateOfWeekPrompt: false,
                notZeroPrompt: false
            },
            opUserConfig: {},
            showCron: true,
            isReset: false,
            dateOfWeekLabel: ['SUN', 'MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT']
            
        }
    },
    updated() {
        this.cronBasicGenerated = this.cronArray.join(' ');
        //MODIFY the array
    },
    computed: {
        hourMinuteInput : {
            get() {
                return this.hourInput + ':' + this.minuteInput;
            },
            set(newValue) {
                [this.hourInput, this.minuteInput] = newValue.split(':');
            }
        },
    },
    methods:{
        setFalse(obj) {
            for (const prop in obj) {
                obj[prop] = false;
            }
        },
        selectTab(num) {
            this.setFalse(this.fieldSelected);
            switch (num){
                case 1:
                    this.fieldSelected.minuteSelected = true;
                    this.minuteInput = '1';
                    this.cronBasicGenerated = '*/1 * * * *';
                    this.cronArray = this.cronBasicGenerated.split(' ');
                    $('#minuteRadio').prop('checked', true);
                    break;
                case 2:
                    this.fieldSelected.hourSelected = true;
                    this.minuteInput = '0';
                    this.hourInput = '1';
                    this.cronBasicGenerated = '0 */1 * * *';
                    this.cronArray = this.cronBasicGenerated.split(' ');
                    break;
                case 3:
                    this.fieldSelected.dateOfMonthSelected = true;
                    this.minuteInput = '0';
                    this.hourInput = '0';
                    this.dateOfMonthInput = '1';
                    this.cronBasicGenerated = '0 0 */1 * *';
                    this.cronArray = this.cronBasicGenerated.split(' ');
                    break;
                case 4: 
                    this.fieldSelected.monthSelected = true;
                    this.minuteInput = '0';
                    this.hourInput = '0';
                    this.dateOfMonthInput = '1';
                    this.monthInput = '1';
                    this.cronBasicGenerated = '0 0 1 */1 *';
                    this.cronArray = this.cronBasicGenerated.split(' ');
                    break;
                case 5:
                    this.fieldSelected.dateOfWeekSelected = true;
                    this.minuteInput = '0';
                    this.hourInput = '0';
                    this.dateOfWeekInput = ["2"];
                    this.cronBasicGenerated = '0 0 * * 2';
                    this.cronArray = this.cronBasicGenerated.split(' ');
                    break;

            }

        },
        changeCronField(num, val) {
            const keys = Object.keys(this.fieldSelected);
            if (Array.isArray(val)) {
                this.cronArray[num] = val.join(',');
            } else if (this.fieldSelected[keys[num]] && parseInt(val)) {

                this.cronArray[num] = '*/' + val;
            }

            else {
                this.cronArray[num] = val;
            }
        },
        resetData() {
            this.minuteInput = '';
            this.hourInput = '';
            this.hourMinuteInput = '';
            this.dateOfMonthInput = '';
            this.monthInput = '';
            this.dateOfWeekInput = [];
            this.cronArray = ['', '', '', '', ''];
            this.cronBasicGenerated = '';
            this.opUserConfig = {};
            this.showCron = true;
            this.isReset = true;
            this.cronQuartzGenerated = '';
            this.setFalse(this.userPrompt);
        },
        saveCron() {
            this.opUserConfig.schedule = this.cronQuartzGenerated;
            $('#cronModal').modal('hide');
        }
    },
    watch: {
        minuteInput: function (val) {
            if(this.isReset) {
                return;
            }

            if (this.fieldSelected.minuteSelected) {
                if ( !/^\d{1,2}$/.test(val) || !_.inRange(parseInt(val, 10), 1, 60)) {
                    this.minuteInput = '';
                    this.userPrompt.notZeroPrompt = true; 
                    return;
                }
            } else {
                if ( !/^\d{1,2}$/.test(val) || !_.inRange(parseInt(val, 10), 0, 60)) {
                    this.minuteInput = '';
                    this.userPrompt.minutePrompt = true;
                    // this.cronArray = ['', '' , '',  '', ''];
                    return;
                }
            }
            this.changeCronField(0, val);
            this.userPrompt.minutePrompt = false;
            this.userPrompt.notZeroPrompt = false;
        },
        hourInput: function (val) {
            if(this.isReset) {
                return;
            }
            if (this.fieldSelected.hourSelected) {
                if ( !/^\d{1,2}$/.test(val) || !_.inRange(parseInt(val, 10), 1, 24)) {
                    this.hourInput = '';
                    this.userPrompt.notZeroPrompt = true; 
                    return;
                }
            } else {
                if ( !/^\d{1,2}$/.test(val) || !_.inRange(parseInt(val, 10), 0, 24)) {
                    this.hourInput = '';
                    this.userPrompt.hourPrompt = true;
                    // this.cronArray = ['', '' , '',  '', ''];
                    return;
                }
            }
            this.changeCronField(1, val);
            this.userPrompt.hourPrompt = false;
            this.userPrompt.notZeroPrompt = false;
        },
        dateOfMonthInput: function (val) {
            if(this.isReset) {
                return;
            }
            if ( !/^\d{1,2}$/.test(val) || !_.inRange(parseInt(val, 10), 1, 32) ) {
                this.dateOfMonthInput = '';
                this.userPrompt.dateOfMonthPrompt = true;
                // this.cronArray = ['', '' ,'', '', ''];
                return;
            }
            this.changeCronField(2, val);
            this.userPrompt.dateOfMonthPrompt = false
        },
        monthInput: function (val) { 
            //noNotZeroPrompt
            if(this.isReset) {
                return;
            }
            if (!/^\d{1,2}$/.test(val) || !_.inRange(parseInt(val, 10), 1, 13) ) {
                this.monthInput = '';
                this.userPrompt.monthPrompt = true;
                // this.cronArray = ['', '' ,'', '', ''];
                return;
            }
            this.changeCronField(3, val);
            this.userPrompt.monthPrompt = false;
        },
        dateOfWeekInput: function (val) {
            if(this.isReset) {
                return;
            }
            this.changeCronField(4, val);
            this.userPrompt.dateOfWeekPrompt = false;
        },
        userPrompt: {
            deep: true,
            handler(newVal) {
              // Check if any field in userPrompt becomes true
                const hasTrueValue = Object.values(newVal).some(value => value === true);
                if (hasTrueValue) {
                // Do something when any field becomes true
                    this.showCron = false;
                } else {
                    this.showCron = true;
                }
            }
        },
        cronBasicGenerated: function (val) { 
            var [minute, hour, dayOfMonth, month, dayOfWeek] = val.split(' ');
            var quartzExpression = `0 ${minute} ${hour} ${(dayOfMonth === '*' && this.fieldSelected.dateOfWeekSelected) ? '?' : (dayOfMonth === '*') ? '*' : dayOfMonth} ${month} ${dayOfWeek === '*' ? '?' : dayOfWeek}`;
            this.cronQuartzGenerated = quartzExpression;
        }

    }
    
});

$('#joinSetup').on('hide.bs.modal', function (e) {
    e.stopPropagation();
});

// $('#queryBuilder').on('hide.bs.modal', function (e) {
//     queryBuilderModal.resetData();
// });

// $('#queryBuilder').on('shown.bs.modal', function (e) {
//     if (!queryBuilderModal.$data.showFlag) {
//         queryBuilderModal.addTableCanvas(queryBuilderModal.$data.query_description);
//         //only call this on modal openning (but all aliases must be loaded first)
//         // queryBuilderModal.mapBoxToColumn(queryBuilderModal.$data.mapAliasColumn);
        
//     }
// });

$('#cronModal').on('hide.bs.modal', function (e) {
    cronModal.resetData();
});

$('#cronModal').on('show.bs.modal', function (e) {
    cronModal.$data.isReset = false;
    cronModal.selectTab(1);
});

