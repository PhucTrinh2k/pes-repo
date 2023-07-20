<%@ page language="java" contentType="text/html; charset=UTF-8"
pageEncoding="UTF-8" %> <%@ taglib uri="http://www.springframework.org/tags"
prefix="spring" %>
<link
    rel="stylesheet"
    href="${_contextPath}/css/user-migration.css?v=${commonEtcData.PRDVER.prd_date }"
/>
<spring:message code="user-migration-customized-column-alert" text="Wrong Format. Correct Format: schema.table.column as alias. Multiple columns are seperated by comma ','" var="user_migration_customized_column_alert" />
<spring:message code="query_builder" text="Query Builder" var="query_builder" />
<spring:message code="var.test_connect" text="연결 테스트" var="test_connect" />
<spring:message code="var.remove_db" text="이 DB 제거" var="remove_db" />
<spring:message code="var.modify" var="modify" />
<spring:message code="var.delete" var="delete" />
<spring:message code="var.other" var="other" />
<spring:message code="var.add_new" text="새로 추가" var="add_new" />
<spring:message code="var.run_mig" text="마이그레이션 실행" var="run_mig" />
<spring:message
    code="var.select_title"
    text="옵션을 선택하세요"
    var="select_title"
/>
<section class="content" id="underrel">
    <input
        id="userMigrationServer"
        type="hidden"
        value="${userMigrationServer}"
    />
    <input id="secretKey" type="hidden" value="${secretKey}" />

    <div style="display: none;"> 
        <span id="connectionStepName">
            <spring:message code="user-migration-connection-step" text="Connection" />
        </span>
        <span id="systemStepName">
            <spring:message code="user-migration-system-step" text="System" />
        </span>
        <span id="queryBuilderStepName">
            <spring:message code="user-migration-query-builder-step" text="Query Builder" />
        </span>
        <span id="configStored">
            <spring:message code="user-migration-config-stored" text="Stored configuration successfully" />
        </span>
        <span id="configEnabled">
            <spring:message code="user-migration-config-enable" text="Enable configuration successfully" />
        </span>
        <span id="configDisabled">
            <spring:message code="user-migration-config-disable" text="Disable configuration successfully" />
        </span>
        <span id="queryUpdated">
            <spring:message code="user-migration-update-query" text="Do you wish to update generated query" />
        </span>
        <span id="cancelStep">
            <spring:message code="user-migration-cancel-step" text="This will revert settings to initial state" />
        </span>
        <span id="joinSetupConfirmation">
            <spring:message code="user-migration-join-confirm" text="Click Save to save changes. Closing the modal will reset join setup" />
        </span>
        <span id="changeStepEnableEdit">
            <spring:message code="user-migration-change-step-edit" text="You are enabling custom query. If you proceed, only your custom query will be saved." />
        </span>

        <span id="emptyConfigName">
            <spring:message code="user-migration-empty-config-name" text="Please enter name for configuration" />
        </span>
        <span id="testConnection">
            <spring:message code="user-migration-test-connection" text="Please test connection before continue" />
        </span>
        <span id="emptyIdSchedule">
            <spring:message code="user-migration-id-schedule" text="Please select idPrefix and schedule before continue" />
        </span>
        <span id="stepNotComplete">
            <spring:message code="user-migration-step-incomplete" text="Please complete all steps before" />
        </span>

        <span id="noJoinColumn">
            <spring:message code="user-migration-no-join-column" text="Please choose join columns in Join Setup" />
        </span>
        <span id="noJoinType">
            <spring:message code="user-migration-no-join-type" text="Please choose join type in Join Setup" />
        </span>
        <span id="allAliases">
            <spring:message code="user-migration-all-aliases" text="Please choose all required aliases" />
        </span>

    </div>
    

    <div id="user-migration">
        
        <div class="search-container m-t-1" v-cloak>
            <table class="table table-search">
                <tbody>
                    <tr>
                        <th width="150">
                            <spring:message
                                code="system_type"
                                text="시스템 유형"
                            />
                        </th>
                        <td class="flex-center" style="width: 300px">
                            <select
                                class="selectpicker"
                                @change="onChangeSystemType"
                            >
                                <option
                                    class="type-option"
                                    v-for="systemType in systemTypes"
                                    :value="systemType"
                                    style="height: 25px"
                                >
                                    {{ systemType }}
                                </option>
                            </select>

                            <i
                                class="fa fa-question-circle question-icon"
                                data-toggle="modal"
                                data-target="#systemOption"
                            ></i>
                        </td>
                    </tr>
                </tbody>
            </table>
        </div>

        <div v-cloak>
            <div class="sp-groupbox flex-center">
                <h4 class="pull-left">
                    <spring:message code="system_config" text="시스템 설정" />
                </h4>
                <i
                    class="fa fa-question-circle question-icon"
                    data-target="#configIntro"
                    @click="openConfigIntroModal"
                ></i>
            </div>
            <div
                class="sp-box"
                v-if="isExistConfig"
                style="padding: 15px 20px !important"
            >
                <table v-if="selectedIndex ===  0" class="table table-list">
                    <thead>
                        <tr>
                            <th width="50">#</th>

                            <!-- Table Header Configuration Name -->
                            <th width="150">
                                <spring:message code="user_migration.table.header.configuration_name" text="Config name" />
                            </th>

                            <!-- <th width="150">
                                <spring:message code="driver" text="드라이버" />
                            </th>
                            <th width="120">
                                <spring:message
                                    code="driver_path"
                                    text="드라이버 경로"
                                />
                            </th> -->
                            <th width="150">URL</th>
                            <!-- <th width="120">
                                <spring:message code="user" text="사용자" />
                            </th>
                            <th width="120">
                                <spring:message
                                    code="user_status"
                                    text="사용자 상태"
                                />
                            </th>
                            <th width="100">
                                <spring:message
                                    code="id_prefix"
                                    text="ID 접두사"
                                />
                            </th>
                            <th width="120">
                                <spring:message
                                    code="system_code"
                                    text="시스템 코드"
                                />
                            </th>
                            <th width="120">
                                <spring:message
                                    code="custom_column"
                                    text="사용자 정의 열"
                                />
                            </th> -->
                            <th width="180">
                                <spring:message
                                    code="query"
                                    text="쿼리입력(SQL)"
                                />
                            </th>
                            <!-- <th width="100">
                                <spring:message
                                    code="max_dept"
                                    text="최대 정보 수"
                                />
                            </th> -->
                            <th width="120">
                                <spring:message
                                    code="schedule2"
                                    text="크론 스케쥴"
                                />
                            </th>
                            <th width="120">
                                <spring:message
                                    code="action"
                                    text="행동"
                                />
                            </th>
                        </tr>
                    </thead>
                    <tbody id="list-log">
                        <tr v-for="(connection, index) in dbConnectionList">
                            <td class="log-file-content">{{ index + 1 }}</td>

                            <!-- Table Column Data Configuration Name -->
                            <td class="log-file-content">
                                <div class="config-content" style="text-align: left;">
                                    {{ connection.configurationName }}
                                </div>
                            </td>  
                            <!-- <td class="log-file-content">
                                <div class="config-content">
                                    {{ connection.driver }}
                                </div>
                            </td>
                            <td class="log-file-content">
                                <div class="config-content">
                                    {{ connection.driverPath }}
                                </div>
                            </td> -->
                            <td class="log-file-content">
                                <div class="config-content" style="text-align: left;">
                                    {{ connection.url }}
                                </div>
                            </td>
                            <!-- <td class="log-file-content">
                                <div class="config-content">
                                    {{ connection.username }}
                                </div>
                            </td>
                            <td class="log-file-content">
                                <div class="config-content">
                                    {{ connection.userStatus }}
                                </div>
                            </td>
                            <td class="log-file-content">
                                <div class="config-content">
                                    {{ connection.idPrefix }}
                                </div>
                            </td> 
                            <td class="log-file-content">
                                <div class="config-content">
                                    {{ connection.systemCodes }}
                                </div>
                            </td>
                            <td class="log-file-content">
                                <div class="config-content">
                                    {{ connection.customColumns }}
                                </div>
                            </td> -->
                            <td class="log-file-content">
                                <div class="config-content" style="text-align: left;">
                                    {{ connection.query }}
                                </div>
                            </td>
                            <!-- <td class="log-file-content">
                                <div class="config-content">
                                    {{ connection.maxDept }}
                                </div>
                            </td> -->
                            <td class="log-file-content">
                                <div class="config-content">
                                    {{ connection.schedule }}
                                </div>
                            </td>
                            <td>
                                <button
                                    class="db-action"
                                    @click="editConfig(connection, false)"
                                >
                                    <i
                                        class="fa fa-pencil"
                                        style="font-size: 22px"
                                        data-toggle="tooltip"
                                        data-placement="bottom"
                                        title="${modify}"
                                    ></i>
                                </button>
                                <!-- user-migration-table: Button enable config -->
                                <button v-if="connection.disable"
                                    class="db-action"   
                                    @click="enableConfig(connection.id)"                                 
                                >
                                    <i
                                        class="fa fa-play"
                                        style="font-size: 22px;"
                                        data-toggle="tooltip"
                                        data-placement="bottom"
                                        title="Enable"
                                    ></i>
                                </button>
                                <!-- user-migration-table: Button disable config -->
                                <button v-else
                                    class="db-action"
                                    @click="disableConfig(connection.id)"
                                    
                                >
                                    <i
                                        class="fa fa-ban"
                                        style="font-size: 22px"
                                        data-toggle="tooltip"
                                        data-placement="bottom"
                                        title="Disable"
                                    ></i>
                                </button>  

                                <button
                                    class="db-action"
                                    @click="deleteConfig(connection.id)"
                                    data-target="#popDeleteConfirm"
                                >
                                    <i
                                        class="fa fa-trash"
                                        style="font-size: 22px"
                                        data-toggle="tooltip"
                                        data-placement="bottom"
                                        title="${delete}"
                                    ></i>
                                </button>
                            </td>
                        </tr>
                    </tbody>
                </table>
                <table v-if="selectedIndex ===  1" class="table table-list">
                    <thead>
                        <tr>
                            <th width="70">#</th>
                            <th width="300">
                                <spring:message
                                    code="file_path"
                                    text="파일 경로"
                                />
                            </th>
                            <th width="300">
                                <spring:message
                                    code="file_backup_path"
                                    text="파일 백업 경로"
                                />
                            </th>
                            <th width="200">
                                <spring:message
                                    code="user_status"
                                    text="사용자 상태"
                                />
                            </th>
                            <th width="100">
                                <spring:message
                                    code="id_prefix"
                                    text="ID 접두사"
                                />
                            </th>
                            <th width="200">
                                <spring:message
                                    code="system_code"
                                    text="시스템 코드"
                                />
                            </th>
                            <th width="100">
                                <spring:message
                                    code="max_dept"
                                    text="최대 정보 수"
                                />
                            </th>
                            <th width="150">
                                <spring:message
                                    code="schedule2"
                                    text="크론 스케쥴"
                                />
                            </th>
                            <th width="150">
                                <spring:message
                                    code="action"
                                    text="행동"
                                />
                            </th>
                        </tr>
                    </thead>
                    <tbody id="list-log">
                        <tr v-for="(connection, index) in dbConnectionList">
                            <td class="log-file-content">{{ index + 1 }}</td>
                            <td class="log-file-content">
                                <div class="config-content">
                                    {{ connection.filePath }}
                                </div>
                            </td>
                            <td class="log-file-content">
                                <div class="config-content">
                                    {{ connection.fileBackupPath }}
                                </div>
                            </td>
                            <td class="log-file-content">
                                <div class="config-content">
                                    {{ connection.userStatus }}
                                </div>
                            </td>
                            <td class="log-file-content">
                                <div class="config-content">
                                    {{ connection.idPrefix }}
                                </div>
                            </td>
                            <td class="log-file-content">
                                <div class="config-content">
                                    {{ connection.systemCodes }}
                                </div>
                            </td>
                            <td class="log-file-content">
                                <div class="config-content">
                                    {{ connection.maxDept }}
                                </div>
                            </td>
                            <td class="log-file-content">
                                <div class="config-content">
                                    {{ connection.schedule }}
                                </div>
                            </td>
                            <td>
                                <button
                                    class="db-action "
                                    @click="editConfig(connection, true)"
                                >
                                    <i
                                        class="fa fa-pencil"
                                        style="font-size: 22px"
                                        data-toggle="tooltip"
                                        data-placement="bottom"
                                        title="${modify}"
                                    ></i>
                                </button>
                                <button
                                    class="db-action"
                                    @click="deleteConfig(connection.id)"
                                    data-target="#popDeleteConfirm"
                                >
                                    <i
                                        class="fa fa-trash"
                                        style="font-size: 22px"
                                        data-toggle="tooltip"
                                        data-placement="bottom"
                                        title="${delete}"
                                    ></i>
                                </button>
                            </td>
                        </tr>
                    </tbody>
                </table>
                <div class="modal-save text-center m-t-20">
                    <div
                        class="btn btn-red common-button"
                        @click="addNewConfig()"
                    >
                        ${add_new}
                    </div>
                </div>
            </div>
            <div v-else-if="!isExistConfig">
                <div v-if="(isUpdateConfig && !isUpdateFile) || (selectedIndex ===  0 && !isUpdateConfig)" v-for="(connection, index) in dbConnectionList"
                >
                    
                    <div v-if="isUpdateConfig && !isUpdateFile" style="text-align: center; margin-bottom: 30px;">
                        <h1 style="color: #444;">
                            {{ connection.configurationName }}
                        </h1>
                    </div>                        
                     
                    <div class="sp-box m-b-10" style="height: 90px;">
                        <div class="step col-md-4" v-for="(step, idx) in steps" :key="index" >
                            <span :class="{active: step.isActive, completed: step.isCompleted || isUpdateConfig }" class="col-md-11" @click="changeStep(idx, connection)"> 
                                {{ step.name }}
                            </span>
                            <span v-if="idx < 2" class="col-md-1"> > </span>
                        </div>
                    </div>
                    <div class="sp-box">
                        <div v-show="steps[0].isActive" style="width: 40%; position: relative; margin-left: 30%; margin-right: 30%;">
                            <form>
                                <!-- Configuration Name-->
                                <div class="form-group row m-b-10">
                                    <label for="inputConfigurationName" style="font-weight: 550;" class="col-md-2 required-input">
                                        <spring:message
                                        code="user_migration.form.label.configuration_name"
                                        text="Name" />
                                        
                                    </label>
                                    
                                    <input type="text" class="col-md-10" id="inputConfigurationName" v-model="connection.configurationName" />
                                                                       
                                </div>                                
                                
                                <!-- Connection Driver -->
                                <div class="form-group row m-b-10">
                                    <label for="driver" style="font-weight: 550;" class="col-md-2 required-input">
                                        <spring:message
                                        code="driver"
                                        text="운전사"
                                        />
                                    </label>
                                    <div class="multiselect col-md-10" style="padding: 0;">
                                        <select
                                            class="selectpicker select-driver"
                                            @change="onChangeDriver($event, connection)"
                                        >
                                            <option
                                                :selected="!connection.driver"
                                                disabled
                                            >
                                                ${select_title}
                                            </option>
                                            <option
                                                v-for="driver in driverList"
                                                :selected="connection.driver && connection.driver.toLowerCase().includes(driver.toLowerCase())"
                                                :value="driver"
                                            >
                                                {{ driver }}
                                            </option>
                                            <!-- <option value="Other">${other}</option> -->
                                        </select>
                                        <input
                                            class="editOption"
                                            style="display: none"
                                            v-model="connection.driver"
                                        />
                                    </div>
                                    <!-- <input class="col-md-10" id="driver" type="text"> -->
                                </div>
                                <div class="form-group row m-b-10">
                                    <label for="driverPath" style="font-weight: 550;" class="col-md-2 required-input">                                     
                                        <spring:message
                                        code="driver_path"
                                        text="드라이버 경로"
                                        />
                                    </label>
                                    <input 
                                        class="col-md-6" id="driverPath" type="text" 
                                        :class="{'error-field' : (hasError && !connection.driverPath)}" 
                                        v-model="driverFile"
                                    />
                                    <div class="file-container col-md-2" style="padding: 0;">
                                        <button for="fileInput" class="btn btn-gray m-r-5 common-button" style="width: 100%; cursor: pointer;">
                                            <spring:message
                                            code="user-migration-choose-file"
                                            text="Choose File"
                                            />                                            
                                        </button>
                                        <input type="file" @change="onChangeDriverFile"  ref="fileInput" class="custom-file-input" id="fileInput" />
                                    </div>
                                    <div class="col-md-2" style="padding: 0;">
                                        <div
                                        class="btn btn-red common-button col-md-2"
                                        style="width: 100%; cursor: pointer;"
                                        @click="chooseDriver(connection)"
                                        >
                                            <spring:message
                                            code="user-migration-upload-file"
                                            text="Upload"
                                            />      
                                        </div>
                                    </div>
                                    <!-- <label for="driverPath" style="font-weight: 550;" class="col-md-2"> Driver Path </label>
                                    <input class="col-md-10" id="driverPath" type="text"> -->
                                </div>
                                <div class="form-group row m-b-10">
                                    <div class="form-group row col-md-6" style="padding: 0px 0px;">
                                        <div class="form-group row" style="padding: 0px 0px;">
                                            <label for="dbUsername" class="col-md-4 required-input" style="font-weight: 550;">
                                                <spring:message
                                                code="username"
                                                text="사용자 이름"
                                                />
                                            </label>
                                            <div class="col-md-8" style="padding-left: 0px;">
                                                <input 
                                                type="text" id="username" placeholder="Username" style="width:94%"
                                                v-model="connection.username"
                                                :class="{'error-field' : (hasError && !connection.username)}"
                                                />
                                            </div>
                                        </div>
                                    </div>
                                    <div class="form-group row col-md-6" style="padding: 0px 0px;">
                                        <div class="form-group row" style="padding: 0px 0px;">
                                            <label for="inputPassword" class="col-md-4 required-input text-center" style="font-weight: 550;">
                                                <spring:message
                                                code="pw"
                                                text="비밀번호"
                                                />
                                            </label>
                                            <div class="col-md-8" style="padding:0px 0px;">
                                                <input 
                                                type="password" class="col-md-8" id="inputPassword" placeholder="Password"
                                                v-model="connection.password"
                                                :class="{'error-field' : (hasError && !connection.password)}"
                                                style="width:100%;"
                                                />
                                            </div>
                                        </div>
                                    </div>                                   
                                </div>
                                <div class="form-group row m-b-10">
                                    <label for="url" style="font-weight: 550;" class="col-md-2 required-input"> URL</label>
                                    <input 
                                    class="col-md-7" type="text" class="form-control" id="url" 
                                    v-model="connection.url"
                                    :class="{'error-field' : (hasError && !connection.url)}"
                                    placeholder="Example: jdbc:postgresql://IP:Port/schema">
                                    <div
                                    class="btn btn-darkgray col-md-3"
                                    @click="testConnection(connection)"
                                    :disabled="isDisableButton(connection)"
                                    >
                                        <spring:message code="test" text="시험" />
                                    </div>

                                </div>
                                <!-- <div class="form-group row m-b-10">
                                    <label for="inputConfigurationName" style="font-weight: 550;" class="col-md-2">
                                        <spring:message
                                        code="user_migration.form.label.configuration_name"
                                        text="Config Name" />
                                        
                                    </label>
                                    
                                    <input type="text" class="col-md-10" id="inputConfigurationName" v-model="connection.configurationName" />
                                                                       
                                </div>  -->

                            </form>

                            <div
                            v-if="connection.connectResult"
                            class="result-text m-t-20"
                            :class="[connection.connectResult === 'Success' ? 'result-success' : 'result-fail']"
                            >
                            {{ connection.connectResult }}
                            </div>
                            <div class="modal-save text-center m-t-20 clearfix" style="width: 40%; position: relative; margin-left: 30%; margin-right: 30%; display: grid; grid-template-columns: 0.5fr 2fr 0.5fr 2fr 0.5fr;">
                                <button
                                    class="btn btn-gray text-center" style="grid-column: 2;"
                                    @click="cancelAction(connection.systemType)"
                                >
                                    <spring:message code="cancel" text="취소" />
                                </button>
                                <button class="btn btn-red text-center" style="grid-column: 4;" @click="changeStep(1, connection)">     <spring:message code="user-migration-next-step" text="Next" />
                                </button>
                            </div>
                        </div>
                        <div v-show="steps[1].isActive" style="width: 40%; position: relative; margin-left: 30%; margin-right: 30%;">
                            <form>
                                <div class="form-group row m-b-10">
                                    <label for="driver" style="font-weight: 550;" class="col-md-2">
                                        <spring:message
                                        code="max_dept"
                                        text="최대 정보 수"
                                        />
                                    </label>
                                    <input class="col-md-10" id="driver" type="number" v-model="connection.maxDept"/>
                                </div>
                                <div class="select-div row m-b-10">
                                    <label for="driverPath" style="font-weight: 550;" class="col-md-2">                                     
                                        <spring:message
                                            code="system_code"
                                            text="시스템 코드"
                                        />                                        
                                    </label>
                                    <div
                                    class="multiselect col-md-10"
                                    :id="'systemcode-dropdown' + index"
                                    style="padding: 0;"
                                    >
                                        <div
                                            class="selectBox"
                                            @click="showSystemCode(connection, index)"
                                        >
                                            <select style="height: 31px">
                                                <option>
                                                    {{
                                                        connection.selectedSystemCode
                                                    }}
                                                </option>
                                            </select>
                                            <div class="overSelect"></div>
                                        </div>
                                        <div
                                            class="select-option"
                                            :id="'systemCode' + index"
                                        >
                                        <div
                                            class="select-row"
                                            v-for="systemCode in connection.systemCodeList"
                                        >
                                            <div
                                                v-if="systemCode.subSystem"
                                                class="dropdown-row"
                                            >
                                                
                                                <input
                                                    type="checkbox"
                                                    :id="systemCode.sysId + index"
                                                    v-model="systemCode.isChecked"
                                                    @change="checkSystemCode(connection, systemCode)"
                                                />
                                                <label
                                                    class="checkmark"
                                                    :for="systemCode.sysId + index"
                                                ></label>                                                
                                                <span class="detail-parent"
                                                    >{{ systemCode.sysName }}
                                                </span>

                                                <ul class="detail-nested">
                                                    <li
                                                        v-for="subSystemL2 in systemCode.subSystem"
                                                        class="dropdown-row"
                                                    >
                                                        <input
                                                            type="checkbox"
                                                            :id="subSystemL2.sysId + index"
                                                            v-model="subSystemL2.isChecked"
                                                            @change="checkSystemCode(connection, subSystemL2)"
                                                        />
                                                        <label
                                                            class="checkmark"
                                                            :for="subSystemL2.sysId + index"
                                                        ></label>                                                    
                                                        <span
                                                            :class="{'detail-parent' : (subSystemL2.subSystem)}"
                                                        >
                                                            {{
                                                                subSystemL2.sysName
                                                            }}
                                                        </span>

                                                        <ul
                                                            class="detail-nested"
                                                            style="
                                                                margin-top: 6px;
                                                            "
                                                        >
                                                            <li
                                                                v-for="subSystemL3 in subSystemL2.subSystem"
                                                                class="dropdown-row"
                                                            >
                                                                <input
                                                                    type="checkbox"
                                                                    :id="subSystemL3.sysId + index"
                                                                    v-model="subSystemL3.isChecked"
                                                                    @change="checkSystemCode(connection, subSystemL3)"
                                                                />
                                                                <label
                                                                    class="checkmark"
                                                                    :for="subSystemL3.sysId + index"
                                                                ></label>
                                                                <span
                                                                    :for="systemCode.sysId"
                                                                    :class="{'detail-parent' : (subSystemL3.subSystem)}"
                                                                >
                                                                    {{
                                                                        subSystemL3.sysName
                                                                    }}
                                                                </span>

                                                            </li>
                                                        </ul>
                                                    </li>
                                                </ul>
                                            </div>
                                            <div v-else class="dropdown-row">
                                                <input
                                                    type="checkbox"
                                                    v-model="systemCode.isChecked"
                                                    :id="systemCode.sysId + index"
                                                    @change="checkSystemCode(connection, systemCode)"
                                                />
                                                <label
                                                    class="checkmark"
                                                    :for="systemCode.sysId + index"
                                                ></label>
                                                <span>{{
                                                    systemCode.sysName
                                                }}</span>

                                            </div>
                                        </div>
                                    </div>
                                </div>                                   

                                </div>
                                <div class="form-group row m-b-10">
                                    <label style="font-weight: 550" class="col-md-2 required-input">
                                        <spring:message
                                        code="id_prefix"
                                        text="ID 접두사"
                                        />
                                    </label>
                                    <input type="text" class="col-md-10" 
                                    v-model="connection.idPrefix"
                                    :class="{'error-field' : (hasError && !connection.idPrefix)}"
                                    />
                                </div>
                                <!-- <div class="form-group row m-b-10">
                                    <label for="" style="font-weight: 550;" class="col-md-2"> 
                                        <spring:message
                                        code="custom_column"
                                        text="사용자 정의 열"
                                        />
                                    </label>
                                    <input class="col-md-10" type="text" v-model.trim="connection.customColumns">
                                </div> -->
                                <div class="select-div row m-b-10">
                                    <label style="font-weight: 550" class="col-md-2">
                                        <spring:message
                                            code="user_status"
                                            text="사용자 상태"
                                        />
                                    </label>
                                    <div
                                        class="multiselect col-md-10"
                                        :id="'status-dropdown' + index"
                                        style="padding: 0;"
                                    >
                                        <div
                                            class="selectBox"
                                            @click="showStatus(connection, index)"
                                        >
                                            <select style="height: 31px">
                                                <option>
                                                    {{ connection.selectedStatus }}
                                                </option>
                                            </select>
                                            <div class="overSelect"></div>
                                        </div>
                                        <div
                                            class="select-option"
                                            :id="'userStatus' + index"
                                        >
                                            <div
                                                class="select-row select-status"
                                                v-for="userStatus in connection.userStatusList"
                                            >
                                                <input
                                                    type="checkbox"
                                                    v-model="userStatus.isChecked"
                                                    :id="userStatus.status + index"
                                                    @change="checkStatus(connection, userStatus)"
                                                    :disabled="userStatus.status === 'NORMAL=0'"
                                                />
                                                <label
                                                    class="checkmark"
                                                    :for="userStatus.status + index"
                                                ></label>                                        
                                                <span>{{ userStatus.status }}</span>
    
                                            </div>
                                        </div>
                                    </div>
                                </div>
                                <div class="form-group row m-b-10">
                                    <label for="input-text-schedule" style="font-weight: 550;" class="col-md-2 required-input"> 
                                        <spring:message
                                        code="schedule2"
                                        text="크론 스케쥴"
                                        />
                                    </label>
                                    <input
                                    readonly
                                    type="text"
                                    v-model="connection.schedule"
                                    :class="{'error-field' : (hasError && !connection.schedule)}"
                                    class="col-md-9"
                                    id="input-text-schedule"
                                    />
                                    <div
                                    class="btn btn-darkgray text-center col-md-1"
                                    @click="showCronModal(connection)"
                                    >
		                            <i
		                                class="fa fa-pencil"
		                                style="font-size: 15px"
		                                data-toggle="tooltip"
		                                data-placement="bottom"
		                                title="${modify}"
		                            ></i>
		                            </div>   
                                </div>
                            </form>
                            <div v-if="!isCustomColumnsCorrect" class="result-text result-fail m-t-20">
                                ${user_migration_customized_column_alert}
                            </div>                            

                            <div class="modal-save text-center m-t-20 clearfix" style="width: 40%; position: relative; margin-left: 30%; margin-right: 30%; display: grid; grid-template-columns: 0.5fr 2fr 0.5fr 2fr 0.5fr;">
                                
                                <button class="btn btn-darkgray text-center" style="grid-column: 2;" @click="changeStep(0,connection)"> 
                                    <spring:message code="user-migration-previous" text="Previous"/>  
                                </button>
                                <button class="btn btn-red text-center" style="grid-column: 4;" @click="changeStep(2, connection)"> 
                                    <spring:message code="user-migration-next-step" text="Next" />
                                </button>
                            </div>
                        </div>
                        
                            
                        <query-builder 
                                
                                ref="queryBuilder"
                                v-if="steps[2].isActive" style="width: 88%; position: relative; margin-left: 6%; margin-right: 6%;"
                                :schemas-prop="queryBuilderProp.schemas"
                                :op-user-config-prop="queryBuilderProp.opUserConfig"
                                :query-prop="queryBuilderProp.query"
                                :db-type-prop="queryBuilderProp.dbType"
                                :querydescription-prop="queryBuilderProp.query_description"
                                :is-custom-query-prop="queryBuilderProp.isCustomQuery"
                                :is-enable-save-config-prop="queryBuilderProp.isEnableSaveConfig"
                                :is-update-config-prop="isUpdateConfig"                               
                                @save-db-config="saveDbConfig"
                                @change-step="(isCustomQuery, updatedQueryDescription, updatedQuery, lastCustomColumns) => {
                                    //queryBuilderProp.query =  isCustomQuery ? customQuery : updatedQuery;
                                    queryBuilderProp.query = updatedQuery;
                                    queryBuilderProp.query_description = isCustomQuery ? null : updatedQueryDescription;
                                    queryBuilderProp.lastCustomColumns = lastCustomColumns;
                                    queryBuilderProp.isCustomQuery = isCustomQuery;
                                    changeStep(1, connection, true);
                                }"
                                @test-run-job="(emittedConnection) => {runJob(emittedConnection, false);}"
                        >   
                          
                        </query-builder>

                        <!-- <query-builder 
                            ref="queryBuilder"
                            v-if="steps[2].isActive && (selectedIndex ===  0 && !isUpdateConfig)" style="width: 88%; position: relative; margin-left: 6%; margin-right: 6%;"
                                :schemas-prop="queryBuilderProp.schemas"
                                :op-user-config-prop="queryBuilderProp.opUserConfig"
                                :query-prop="queryBuilderProp.query"
                                :querydescription-prop="queryBuilderProp.query_description"
                                :is-update-config-prop="isUpdateConfig"
                                @save-db-config="saveDbConfig"
                                @change-step="(updatedQueryDescription, updatedQuery, lastCustomColumns) => {
                                    queryBuilderProp.query = updatedQuery;
                                    queryBuilderProp.query_description = updatedQueryDescription;
                                    queryBuilderProp.lastCustomColumns = lastCustomColumns;
                                    changeStep(1, connection, true);
                                }"
                                @test-run-job="(emittedConnection) => {runJob(emittedConnection, false);}"
                        >   
                  
                        </query-builder> -->
                        

                    </div>
                </div>
                <div
                    v-if="(selectedIndex ===  1 && !isUpdateConfig) || isUpdateFile"
                >
                    <div
                        class="sp-box"
                        v-for="(connection, index) in dbConnectionList"
                    >
                        <div class="db-title">
                            <spring:message
                                code="trace_config"
                                text="X-Trace 파일 구성"
                            />
                        </div>

                        <div class="flex-between m-b-15">
                            <div class="input-block" style="width: 48%">
                                <label for="filePath" style="font-weight: 550">
                                    <spring:message
                                        code="file_path"
                                        text="파일 경로"
                                    />
                                </label>
                                <input
                                    type="text"
                                    id="filePath"
                                    class="input-text"
                                    style="width: 83.2%"
                                    v-model="connection.filePath"
                                    :class="{'error-field' : (hasError && !connection.filePath)}"
                                />
                            </div>
                            <div class="input-block" style="width: 48%">
                                <label
                                    for="fileBackupPath"
                                    style="font-weight: 550"
                                >
                                    <spring:message
                                        code="file_backup_path"
                                        text="파일 백업 경로"
                                    />
                                </label>
                                <input
                                    type="text"
                                    id="fileBackupPath"
                                    class="input-text"
                                    style="width: 83.2%"
                                    v-model="connection.fileBackupPath"
                                    :class="{'error-field' : (hasError && !connection.fileBackupPath)}"
                                />
                            </div>
                        </div>

                        <div class="flex-between m-b-15">
                            <div
                                class="input-block report-treeview-force"
                                style="width: 48%"
                            >
                                <label style="font-weight: 550">
                                    <spring:message
                                        code="system_code"
                                        text="시스템 코드"
                                    />
                                </label>
                                <div
                                    class="multiselect"
                                    :id="'systemcode-dropdown' + index"
                                >
                                    <div
                                        class="selectBox"
                                        @click="showSystemCode(connection, index)"
                                    >
                                        <select style="height: 31px">
                                            <option>
                                                {{
                                                    connection.selectedSystemCode
                                                }}
                                            </option>
                                        </select>
                                        <div class="overSelect"></div>
                                    </div>
                                    <div
                                        class="select-option"
                                        :id="'systemCode' + index"
                                    >
                                        <div
                                            class="select-row"
                                            v-for="systemCode in connection.systemCodeList"
                                        >
                                            <div
                                                v-if="systemCode.subSystem"
                                                class="dropdown-row"
                                            >
                                                <span class="detail-parent"
                                                    >{{ systemCode.sysName }}
                                                </span>
                                                <input
                                                    type="checkbox"
                                                    :id="systemCode.sysId + index"
                                                    v-model="systemCode.isChecked"
                                                    @change="checkSystemCode(connection, systemCode)"
                                                />
                                                <label
                                                    class="checkmark"
                                                    :for="systemCode.sysId + index"
                                                ></label>
                                                <ul class="detail-nested">
                                                    <li
                                                        v-for="subSystemL2 in systemCode.subSystem"
                                                        class="dropdown-row"
                                                    >
                                                        <span
                                                            :class="{'detail-parent' : (subSystemL2.subSystem)}"
                                                        >
                                                            {{
                                                                subSystemL2.sysName
                                                            }}
                                                        </span>
                                                        <input
                                                            type="checkbox"
                                                            :id="subSystemL2.sysId + index"
                                                            v-model="subSystemL2.isChecked"
                                                            @change="checkSystemCode(connection, subSystemL2)"
                                                        />
                                                        <label
                                                            class="checkmark"
                                                            :for="subSystemL2.sysId + index"
                                                        ></label>
                                                        <ul
                                                            class="detail-nested"
                                                            style="
                                                                margin-top: 6px;
                                                            "
                                                        >
                                                            <li
                                                                v-for="subSystemL3 in subSystemL2.subSystem"
                                                                class="dropdown-row"
                                                            >
                                                                <span
                                                                    :for="systemCode.sysId"
                                                                    :class="{'detail-parent' : (subSystemL3.subSystem)}"
                                                                >
                                                                    {{
                                                                        subSystemL3.sysName
                                                                    }}
                                                                </span>
                                                                <input
                                                                    type="checkbox"
                                                                    :id="subSystemL3.sysId + index"
                                                                    v-model="subSystemL3.isChecked"
                                                                    @change="checkSystemCode(connection, subSystemL3)"
                                                                />
                                                                <label
                                                                    class="checkmark"
                                                                    :for="subSystemL3.sysId + index"
                                                                ></label>
                                                            </li>
                                                        </ul>
                                                    </li>
                                                </ul>
                                            </div>
                                            <div v-else class="dropdown-row">
                                                <span>{{
                                                    systemCode.sysName
                                                }}</span>
                                                <input
                                                    type="checkbox"
                                                    v-model="systemCode.isChecked"
                                                    :id="systemCode.sysId + index"
                                                    @change="checkSystemCode(connection, systemCode)"
                                                />
                                                <label
                                                    class="checkmark"
                                                    :for="systemCode.sysId + index"
                                                ></label>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                            <div class="input-block" style="width: 48%">
                                <label style="font-weight: 550">
                                    <spring:message
                                        code="user_status"
                                        text="사용자 상태"
                                    />
                                </label>
                                <div
                                    class="multiselect"
                                    :id="'status-dropdown' + index"
                                >
                                    <div
                                        class="selectBox"
                                        @click="showStatus(connection, index)"
                                    >
                                        <select style="height: 31px">
                                            <option>
                                                {{ connection.selectedStatus }}
                                            </option>
                                        </select>
                                        <div class="overSelect"></div>
                                    </div>
                                    <div
                                        class="select-option"
                                        :id="'userStatus' + index"
                                    >
                                        <div
                                            class="select-row select-status"
                                            v-for="userStatus in connection.userStatusList"
                                        >
                                            <span>{{ userStatus.status }}</span>
                                            <input
                                                type="checkbox"
                                                v-model="userStatus.isChecked"
                                                :id="userStatus.status + index"
                                                @change="checkStatus(connection, userStatus)"
                                                :disabled="userStatus.status === 'NORMAL=0'"
                                            />
                                            <label
                                                class="checkmark"
                                                :for="userStatus.status + index"
                                            ></label>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div class="flex-between m-b-15">
                            <div class="input-block" style="width: 48%">
                                <label style="font-weight: 550; width: 90px;">
                                    <spring:message
                                        code="max_dept"
                                        text="최대 정보 수"
                                    />
                                </label>
                                <input
                                    type="number"
                                    class="input-text"
                                    style="width: 83.2%"
                                    v-model="connection.maxDept"
                                />
                            </div>
                            <div class="input-block" style="width: 48%">
                                <!-- <label style="font-weight: 550">
                                    <spring:message
                                        code="schedule2"
                                        text="크론 스케쥴"
                                    />
                                </label>
                                <input
                                    type="text"
                                    class="input-text"
                                    style="width: 83.2%"
                                    v-model="connection.schedule"
                                    :class="{'error-field' : (hasError && !connection.schedule)}"
                                /> -->
                                <label style="font-weight: 550">
                                    <spring:message
                                        code="schedule2"
                                        text="크론 스케쥴"
                                    />
                                </label>
                                <input
                                    type="text"
                                    class="input-text"
                                    v-model="connection.schedule"
                                    :class="{'error-field' : (hasError && !connection.schedule), 'input-cron-edit-ko': (lang === 'ko'),
                                    'input-cron-edit-en': (lang === 'en')}"
                                    id="input-text-schedule"
                                />
		                         <div
		                        class="btn btn-darkgray common-button"
                                @click="showCronModal(connection)"
		                        >
		                            <i
		                                class="fa fa-pencil"
		                                style="font-size: 15px"
		                                data-toggle="tooltip"
		                                data-placement="bottom"
		                                title="${modify}"
		                            ></i>
		                        </div> 
                            </div>
                        </div>
                        <div class="input-block flex-between m-b-15">
                            <label style="font-weight: 550">
                                <spring:message
                                    code="id_prefix"
                                    text="ID 접두사"
                                />
                            </label>
                            <input
                                style="width: 91.95%"
                                type="text"
                                class="input-text"
                                v-model="connection.idPrefix"
                                :class="{'error-field' : (hasError && !connection.idPrefix)}"
                            />
                        </div>
                        <div
                            v-if="connection.connectResult"
                            class="result-text"
                            :class="[connection.connectResult === 'Success' ? 'result-success' : 'result-fail']"
                        >
                            {{ connection.connectResult }}
                        </div>
                        <div class="modal-save text-center m-t-20">
                            <div
                                class="btn btn-gray m-r-5 common-button"
                                @click="cancelAction(2)"
                            >
                                <spring:message code="cancel" text="취소" />
                            </div>
                            <div
                                class="btn btn-darkgray m-r-5 common-button"
                                style="width: auto"
                                @click="runJob(connection, true)"
                            >
                                ${run_mig}
                            </div>
                            <div
                                class="btn btn-red common-button"
                                style="width: auto"
                                @click="saveDbConfig()"
                            >
                                <spring:message code="save" text="저장" />
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>
</section>
<!-- // .content-wrapper End -->
<!-- // .wrapper_END -->

<!-- System Option Modal -->
<div
    class="modal fade"
    id="systemOption"
    tabindex="-1"
    role="dialog"
    aria-labelledby="myModalLabel"
    aria-hidden="true"
>
    <div class="modal-dialog modal-1000">
        <div class="modal-content">
            <div class="modal-header panel-heading">
                <button type="button" class="close" data-dismiss="modal">
                    <span aria-hidden="true"></span>
                    <span class="sr-only">Close</span>
                </button>
                <div class="header-description">
                    <h4>
                        <spring:message
                            code="system_description"
                            text="시스템 유형 설명"
                        />               
                    </h4>
                    <ul class="system-tabset" style="margin-left: 5%;">
                        <li><a href="#" @click="selectTab($event,'tab01')" :class="{ on: tab1Selected }">DB연동</a></li>
                        <li><a href="#" @click="selectTab($event,'tab02')" :class="{ on: tab2Selected }">파일연동</a></li>
                    </ul>
                </div>
            </div>
            <div class="modal-body panel-body">
                <div class="tabs" style="position: relative;">
                    <div id="tab01" style="position: relative; width: 100%; margin-bottom: 30px"
                    v-if="tab1Selected">

                        <div class="w-display-container description-slides">
                            <img src="${_contextPath}/img/DB_migration_1.png" style="width:100%; height: 600px;">
                            <div class="w-display-bottommiddle w-large w-container w-padding-16 w-black"
                            style="padding-top: 10px; padding-bottom: 10px;">
                            적용방안 1
                            </div>
                        </div>

                        <div class="w-display-container description-slides">
                            <img src="${_contextPath}/img/DB_migration_2.png" style="width:100%; height: 600px;">
                            <div class="w-display-bottommiddle w-large w-container w-padding-16 w-black"
                            style="padding-top: 10px; padding-bottom: 10px;">
                            적용방안 2
                            </div>
                        </div>

                        <div class="w-display-container description-slides">
                            <img src="${_contextPath}/img/DB_migration_3.png" style="width:100%; height: 600px;">
                            <div class="w-display-bottommiddle w-large w-container w-padding-16 w-black"
                            style="padding-top: 10px; padding-bottom: 10px;">
                            적용방안 3
                            </div>
                        </div>
                        <button class="w-button w-display-left w-black" @click="plusDivs(-1)">&#10094;</button>
                        <button class="w-button w-display-right w-black" @click="plusDivs(1)">&#10095;</button>
                        
                    </div>
                    <div class="pages" id="tab02" style="position: relative; width: 100%; margin-bottom: 30px"
                    v-if="tab2Selected">
                        <div class="w-display-container description-slides">
                            <img src="${_contextPath}/img/FIle_migration_1.png" style="width:100%; height: 600px;">
                            <div class="w-display-bottommiddle w-large w-container w-padding-16 w-black"
                            style="padding-top: 10px; padding-bottom: 10px;">
                            적용방안 1
                            </div>
                        </div>
                        <button class="w-button w-display-left w-black" @click="plusDivs(-1)">&#10094;</button>
                        <button class="w-button w-display-right w-black" @click="plusDivs(1)">&#10095;</button>
                    </div>
                </div>
            </div>
        </div>
    </div>
</div>
<!-- System Option Modal - End -->

<!-- Modal 데이터 삭제 확인 : 공통 -->
<div
    class="modal fade"
    id="deleteConfirmPopup"
    tabindex="-1"
    role="dialog"
    aria-labelledby="myModalLabel"
    aria-hidden="true"
>
    <div class="modal-dialog modal-450">
        <div class="modal-content">
            <div class="modal-header panel-heading">
                <button type="button" class="close" data-dismiss="modal">
                    <span aria-hidden="true"></span>
                    <span class="sr-only">Close</span>
                </button>
                <!-- check | 확인 -->
                <h4>
                    <spring:message code="confirm-title" text="Confirmation" />
                </h4>
            </div>
            <!-- 타이틀 -->

            <!-- Are you sure you want to delete this configuration? | 이 구성을 삭제하시겠습니까?-->
            <div class="modal-body panel-body">
                <spring:message code="user-migration-confirm-delete-content" text="Are you sure you want to delete this?" />
            </div>
            <!-- 내용 -->

            <div class="modal-footer">
                <div class="line"></div>
                <!-- cancellation | 취소 -->
                <div class="btn btn-gray p-w-35" data-dismiss="modal">
                    <spring:message code="cancel" text="취소" />
                </div>

                <!-- delete | 삭제 -->
                <div class="btn btn-red p-w-35" @click="deleteConfig()">
                    <spring:message code="proceed" text="Proceed" />
                </div>
            </div>
            <!-- 푸터 -->
        </div>
        <!-- 모달 콘텐츠 -->
    </div>
    <!-- 모달 다이얼로그 -->
</div>
<!-- 모달 전체 윈도우_END -->
<!-- // Modal 데이터 삭제 확인 : 공통 -->

<!-- Database info Modal -->
<div
    class="modal fade"
    id="databaseInfo"
    tabindex="-1"
    role="dialog"
    aria-labelledby="myModalLabel"
    aria-hidden="true"
>
    <div class="modal-dialog modal-800">
        <div class="modal-content">
            <div class="modal-header panel-heading">
                <button type="button" class="close" data-dismiss="modal">
                    <span aria-hidden="true"></span>
                    <span class="sr-only">Close</span>
                </button>
                <h4>
                    <spring:message
                        code="cus_db_info"
                        text="고객 데이터베이스 정보"
                    />
                </h4>
            </div>
            <!-- 타이틀 -->

            <div class="modal-body panel-body">
                <div v-if="schemas">
                    <table class="table">
                        <tbody>
                            <tr v-for="(schema, index) in schemas">
                                <td style="padding: 0">
                                    <div
                                        class="parent-info"
                                        @click="showTables(schema, index)"
                                    >
                                        {{ schema }}
                                    </div>
                                    <table
                                        class="table detail-nested nested-tabl"
                                    >
                                        <tbody
                                            style="width: 100%; display: table"
                                        >
                                            <tr v-for="(table, idx) in tables">
                                                <td style="padding: 0">
                                                    <div
                                                        class="column-info"
                                                        :class="('column-' + index)"
                                                        style="
                                                            padding-left: 30px;
                                                        "
                                                        @click="showColumns(schema, table, index, idx)"
                                                    >
                                                        {{ table }}
                                                    </div>
                                                    <table
                                                        class="table detail-nested"
                                                    >
                                                        <tbody
                                                            style="
                                                                width: 100%;
                                                                display: table;
                                                            "
                                                        >
                                                            <tr
                                                                v-for="column in columns"
                                                            >
                                                                <td
                                                                    style="
                                                                        padding: 5px
                                                                            0;
                                                                    "
                                                                >
                                                                    <div
                                                                        style="
                                                                            padding-left: 60px;
                                                                        "
                                                                    >
                                                                        {{
                                                                            column
                                                                        }}
                                                                    </div>
                                                                </td>
                                                            </tr>
                                                        </tbody>
                                                    </table>
                                                </td>
                                            </tr>
                                        </tbody>
                                    </table>
                                </td>
                            </tr>
                        </tbody>
                    </table>
                </div>
                <div v-else>
                    <spring:message
                        code="cus_db_info_error"
                        text="데이터베이스 정보를 가져올 수 없습니다"
                    />
                </div>
            </div>

            <div class="modal-save text-center m-t-20">
                <div
                    class="btn btn-darkgray m-r-5 text-center"
                    data-dismiss="modal"
                    @click="closeModal"
                >
                    <spring:message code="close" text="닫다" />
                </div>
            </div>
        </div>
    </div>
</div>
<!-- Database info Modal - End -->
<script type="text/x-template" id="queryBuilder">
    <div>
        <div class="modal-header panel-heading" style="border: 0; padding: 0;">
            <h4>
                <spring:message code="query_builder" text="쿼리 빌더" />
            </h4>
        </div>
        <div class="modal-header panel-heading" style="display: flex; border: 0; padding: 15px 0px;">
            <div style="width:20; display: flex;"> 
                <h4 style="border:none; padding: 0;"> 
                    <spring:message code="user-migration-aliases" text="Aliases" /> 
                </h4> &nbsp;
                <i
                class="fa fa-question-circle question-icon" style="align-self: center;"
                data-toggle="modal"
                data-target="#aliasIntroModal"
                ></i>
            </div>
            <div style="margin-right: 0; margin-left: auto;">
                <button class="btn btn-darkgray m-r-5 text-center"
                :disabled="selected.length <= 1"
                @click="openJoinSetup"   >
                    <spring:message code="user-migration-join-setup" text="Join Setup" /> 
                </button>
                <button class="btn btn-red text-center"
                @click="addTable">
                    <spring:message code="user-migration-add-table" text="Add Table" /> 
                </button>
            </div>
        </div>
        <div class="modal-body panel-body" style="margin: 0;">
            <div v-if="schemas" class="search-container" style="height: 590px; display: grid; border: none; grid-template-columns: 1fr 0.5fr 12fr">
                <div class="panel-body flex-start-box" id="box-container" style="grid-column: 1" @dragover="allowDrop" @drop="dropEventHandler"> 
                    <div v-for="(col, index) in aliasColumns" :key="index" :id="index" class="draggable-box text-center"
                    :class="{required: [0, 1, 4, 15].includes(index)}" draggable="true" @dragstart="dragStartEventHandler($event, index)"  @dragover="false" > 
                        {{ col }} 
                        <div class="tooltiptext" draggable="false" v-html="formattedTooltipText(index)"> </div>
                    </div>
                </div>

                <div class="table-canvas" style="grid-column: 3">
                    <div v-for="(item, selectedIndex) in selected" :key="selectedIndex" 
                    style="height: 450px; margin-top: 15px; margin-bottom: 70px;" class="table-selected"> 
                    
                        <table class="table table-search table-search-custom">
                            <tbody>
                                <tr>
                                    <th width="120">Schema</th>
                                    <td width="240" class="text-center" style="border: 0;">
                                        <select
                                            class="selectpicker"
                                            v-model="item.selectedSchema"
                                            data-width="80%"
                                            @change="userChangeProperty"
                                            
                                        >
                                            <option
                                                class="type-option"
                                                style="height: 25px"
                                                value=""
                                            >
                                                Select
                                            </option>
                                            <option
                                                class="type-option"
                                                v-for="schema in schemas"
                                                style="height: 25px"
                                            >
                                                {{ schema }}
                                            </option>
                                        </select>
                                    </td>
                                    <th width="120">Table</th>
                                    <td width="240" class="text-center" style="border: 0;">
                                        <select
                                            class="selectpicker"
                                            v-model="item.selectedTable"
                                            :disabled="!item.tables.length"
                                            data-width="80%"
                                            @change="userChangeProperty"
                                        >
                                            <option
                                                class="type-option"
                                                style="height: 25px"
                                                value=""
                                            >
                                                Select
                                            </option>
                                            <option
                                                class="type-option"
                                                v-for="table in item.tables"
                                                style="height: 25px"
                                            >
                                                {{ table }}
                                            </option>
                                        </select>
                                        <span class="delete-table" @click="deleteTable(selectedIndex)"
                                        > 
                                            <span class="delete-button"> &times; </span> 
                                            <!-- <div class="tooltiptext">Delete table </div> -->
                                        </span>
                                    </td> 
                                    <!-- <th  @click="deleteTable(selectedIndex)" style="cursor: pointer; font-size: 20px; width: 47.75px;"> 
                                        &times; 
                                    </th> -->

                                </tr>
                            </tbody>
                        </table>

                        <div class="modal-body-db-table" v-if="item.resultData">
                            <table class="table table-bordered">
                                <thead style="position: sticky; top: 0px;">
                                    <tr>
                                        <th v-for="(columnName, idx) in item.resultData.columnNames"
                                        scope="col" :id="'tHead-' + selectedIndex + '-' + columnName" @drop="dropEventHandler($event, selectedIndex, idx)" @dragover="allowDrop" style="border-left: 0px;">
                                                {{ columnName }}
                                            
                                        </th>
                                    </tr>
                                </thead>
                                <tbody>
                                    <tr
                                        v-if="item.resultData.rowResults"
                                        v-for="rowResult in item.resultData.rowResults"
                                    >
                                        <td
                                            v-for="result in rowResult"
                                            class="text-center sql-result"
                                        >
                                            {{ result.value }}
                                        </td>
                                    </tr>
                                </tbody>
                            </table>
                        </div>
                        
                        <div v-if="!item.resultData">
                            <br>
                            <br>

                            <table class="table table-bordered" style="margin-inline: auto; max-width: 900px; border-width: 0px;">
                                <thead>
                                    <tr>
                                    </tr>
                                </thead>
                                <tbody>
                                    <tr>
                                        <td colspan="2" style="border-width: 0px;">
                                            <div class="no-data" style="margin: 25px auto;">
                                                <spring:message code="user-migration-no-data" text="No data to display" /> 
                                            </div>
                                        </td>
                                    </tr>
                                </tbody>
                            </table>
                        </div>

                    </div>
                </div>
            </div>
            <div v-else>
                <spring:message
                    code="cus_db_info_error"
                    text="데이터베이스 정보를 가져올 수 없습니다"
                />
            </div>
            <div class="mt-10">
                <label for="modal_query" class="test-label db-title mb-5">
                    <spring:message code="user-migration-query" text="Query" /> 
                </label>
                <div style="display: flex; justify-content: space-between; ">
                    <textarea
                    id="modal_query"
                    class="form-control query-text"
                    style="width: 85%; min-width: none;"
                    rows="6"
                    :value="query"
                    :readonly="!isCustomQuery"
                    @change="editCustomQuery"
                    ></textarea>
                    
                    <div style="display: grid;">
                        <button class="btn btn-red text-center" style="align-self: start;" @click="testQuery('test')">
                            <spring:message code="user-migration-test-query" text="Test Query" /> 
                        </button>

                        <button class="btn btn-darkgray text-center" style="align-self: end;" @click="isCustomQuery = !isCustomQuery">
                            <span v-if="isCustomQuery">
                                <spring:message code="user-migration-disable-edit" text="Disable Edit" />
                            </span>
                            <span v-else>
                                <spring:message code="user-migration-enable-edit" text="Enable Edit" />
                            </span>
                        </button>
                    </div>


                </div>

            </div>
        </div>
        
        <div class="modal-save text-center m-t-20 navigation-div">

            <button class="btn btn-darkgray text-center inner-div" @click="$emit('change-step', isCustomQuery, query_description, query, opUserConfig.customColumns)">
                <spring:message
                code="user-migration-previous"
                text="Previous"
                />  
            </button>
            <button
                class="btn btn-darkgray text-center inner-div"
                style="width: auto"
                @click="testRunJob()"
                v-if="isUpdateConfigProp"
            >
                ${run_mig}
            </button>
            <button
                class="btn btn-darkgray text-center inner-div"
                style="width: auto"
                @click="testRunJob()"
                :disabled="opUserConfig.connectResult !== 'Success'"
                v-if="!isUpdateConfigProp"
            >
                ${run_mig}
            </button>
            <!-- <button
                class="btn btn-red text-center inner-div"
                @click="saveQuery(false)"
                v-if="isUpdateConfigProp"
            >
                Update Config
            </button> -->
            <button
                class="btn btn-red text-center inner-div"
                @click="saveQuery(false)"
                :disabled="!isEnableSaveConfig"
            >
                <spring:message
                code="save"
                text="Save"
                />                
            </button>
        </div>
        <div
        class="modal fade"
        id="joinSetup"
        tabindex="-1"
        role="dialog"
        >
            <div class="modal-dialog modal-1100">
                <div class="modal-content" style="height: 80%;">
                    <div class="modal-header panel-heading">
                        <button type="button" class="close" @click="closeInner">
                            <span aria-hidden="true"></span>
                            <span class="sr-only">Close</span>
                        </button>
                        <h4>
                            <spring:message
                            code="user-migration-join-setup"
                            text="Join Setup"
                            /> 
                        </h4>
                    </div>
                    <div class="panel-body modal-join-columns" style="height: 600px;" v-if="selected.length > 1">

                        <div class="row-container m-b-20" style="display: flex;" v-for="(value, index) in selected.slice(0, selected.length - 1)" :key="index">
                            <div class="button-container" style="width: 9%; display: flex; flex-direction: column;">
                                <div class="btn btn-red m-b-5 text-center" @click="addJoinColumns(2*index)" style="width: 75%;">
                                    <spring:message
                                    code="add"
                                    text="Add"
                                    />                              
                                </div>
                                <div class="btn btn-gray m-b-5 text-center" @click="toggleDeleteColumnVisible(index)"
                                :key="`delete-button-${index}`" style="width: 75%;">
                                    <span v-if="!deleteColumnVisible[index]">
                                        <spring:message
                                        code="delete"
                                        text="Delete"
                                        />  
                                    </span>
                                    <span v-else>
                                        <spring:message
                                        code="back"
                                        text="Back"
                                        />  
                                    </span>
                                </div>

                            </div>

                            <div class="table-container" style="width: 91%;"> 

                                <table class="table table-bordered table-setup" style="margin-inline: auto; max-width: none; width:95%; margin-left: 0;" >
                                    <thead> 
                                        <tr>
                                            <th>
                                                <spring:message
                                                code="user-migration-left-table"
                                                text="Left Table"
                                                />                                                  
                                            </th>
                                            <th>
                                                <spring:message
                                                code="user-migration-left-column-join"
                                                text="Left Column Join"
                                                />  
                                            </th>
                                            <th> 
                                                <spring:message
                                                code="user-migration-join-type"
                                                text="Join Type"
                                                />       
                                            </th>
                                            <th>
                                                <spring:message
                                                code="user-migration-right-table"
                                                text="Right Table"
                                                />  
                                            </th>
                                            <th>
                                                <spring:message
                                                code="user-migration-right-column-join"
                                                text="Right Column Join"
                                                />  
                                            </th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        <tr v-for="(item, idx) in joinColumns[2*index]" :key="idx">
                                            <td :rowspan="joinColumns[2*index].length" v-if="idx === 0" style="text-align: center; width: 110px;">
                                               <div class="table-name"> {{ selected[index].selectedTable }} </div>
                                            </td>
                                            <td class="text-center" style="width: 200px;">
                                                <select class="select-picker" v-model="joinColumns[2*index][idx]">
                                                    <option class="type-option" value=""> SELECT </option>
                                                    <option class="type-option" v-for="element in selected[index].columns"> 
                                                        {{ element.columnName }}
                                                    </option> 
                                                </select>
                                            </td>
                                            <td :rowspan="joinColumns[2*index].length" v-if="idx === 0" class="text-center" style="width: 200px;">  
                                                <select class="select-picker" v-model="joinTypes[index]">
                                                    <option selected value=""> SELECT </option> 
                                                    <option> INNER JOIN</option>
                                                    <option> LEFT JOIN</option>
                                                    <option> RIGHT JOIN</option>
                                                </select>
                                            </td>
                                            <td :rowspan="joinColumns[2*index].length" v-if="idx === 0" style="text-align: center; width: 110px;">
                                                <div class="table-name"> {{ selected[index+1].selectedTable }} </div>
                                            </td>
                                            <td class="text-center" style="width: 200px;">
                                                <select class="select-picker" v-model="joinColumns[2*index + 1][idx]">
                                                    <option class="type-option" value=""> SELECT </option>
                                                    <option class="type-option" v-for="element in selected[index+1].columns"> 
                                                        {{ element.columnName }}
                                                    </option> 
                                                </select>
                                                <span class="delete-join-columns" @click="deleteJoinColumn(2*index, idx)"
                                                v-if="deleteColumnVisible[index]"> 
                                                    <!-- &times; -->
                                                    <span class="delete-button"> &times; </span> 
                                                </span>
                                            </td>
                                        </tr>
                                    </tbody>    
                                </table>
                            </div>
                        </div>    

                    </div>
                    <div class="modal-save text-center m-t-10 modal-footer-custom">
                        <div class="btn btn-red text-center" style="grid-column: 3;" @click="saveJoinCoulmn">
                            <spring:message
                            code="save"
                            text="Save"
                            />  
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>
</script>


<!-- Query Result Modal -->
<div
    class="modal fade"
    id="queryResult"
    tabindex="-1"
    role="dialog"
    aria-labelledby="myModalLabel"
    aria-hidden="true"
>
    <div class="modal-dialog modal-1100">
        <div class="modal-content">
            <div class="modal-header panel-heading">
                <button type="button" class="close" data-dismiss="modal">
                    <span aria-hidden="true"></span>
                    <span class="sr-only">Close</span>
                </button>
                <h4>
                    <spring:message code="query_result" text="쿼리 결과" />
                </h4>
            </div>
            <!-- 타이틀 -->

            <div class="modal-body panel-body" style="overflow: auto;">
                <table class="table table-bordered" style="margin-inline: auto;" v-if="resultData">
                    <thead>
                        <tr>
                            <th
                                v-for="columnName in resultData.columnNames"
                                scope="col"
                            >
                                {{ columnName }}
                            </th>
                        </tr>
                    </thead>
                    <tbody>
                        <tr
                            v-if="resultData.rowResults"
                            v-for="rowResult in resultData.rowResults"
                        >
                            <td
                                v-for="result in rowResult"
                                class="text-center sql-result"
                            >
                                {{ result.value }}
                            </td>
                        </tr>
                    </tbody>
                </table>
            </div>

            <div class="modal-save text-center m-t-20">
                <div
                    class="btn btn-darkgray m-r-5 text-center"
                    data-dismiss="modal"
                >
                    <spring:message code="close" text="닫다" />
                </div>
            </div>
        </div>
    </div>
</div>
<!-- Query Result Modal - End -->

<!-- Config Intro Modal -->
<div
    class="modal fade"
    id="configIntro"
    tabindex="-1"
    role="dialog"
    aria-labelledby="myModalLabel"
    aria-hidden="true"
>
    <div class="modal-dialog modal-800">
        <div class="modal-content">
            <div class="modal-header panel-heading">
                <button type="button" class="close" data-dismiss="modal">
                    <span aria-hidden="true"></span>
                    <span class="sr-only">Close</span>
                </button>
                <h4>
                    <spring:message code="config_intro" text="구성 설명" />
                </h4>
            </div>
            <!-- 타이틀 -->

            <div class="modal-body panel-body">
                <table class="table">
                    <tbody>
                        <tr v-if="option == 1">
                            <th width="180">
                                <spring:message code="driver" text="운전사" />
                            </th>
                            <td>
                                <spring:message
                                    code="driver_name"
                                    text="JDBC 드라이버 이름"
                                />
                            </td>
                        </tr>
                        <tr v-if="option == 1">
                            <th width="180">
                                <spring:message
                                    code="driver_path"
                                    text="드라이버 경로"
                                />
                            </th>
                            <td>
                                <spring:message
                                    code="driver_path_des"
                                    text="서버의 JDBC 드라이버 jar 파일 경로"
                                />
                            </td>
                        </tr>
                        <tr v-if="option == 1">
                            <th width="180">
                                <spring:message
                                    code="username"
                                    text="사용자 이름"
                                />
                            </th>
                            <td>
                                <spring:message
                                    code="username_des"
                                    text="데이터베이스에 로그인할 계정의 사용자 이름"
                                />
                            </td>
                        </tr>
                        <tr v-if="option == 1">
                            <th width="180">
                                <spring:message
                                    code="pw"
                                    text="비밀번호"
                                />
                            </th>
                            <td>
                                <spring:message
                                    code="password_des"
                                    text="데이터베이스에 로그인할 계정의 비밀번호"
                                />
                            </td>
                        </tr>
                        <tr v-if="option == 1">
                            <th width="180">URL</th>
                            <td>
                                <spring:message
                                    code="url_des"
                                    text="JDBC에 액세스하기 위한 URL"
                                />
                            </td>
                        </tr>
                        <tr>
                            <th width="180">
                                <spring:message
                                    code="id_prefix"
                                    text="ID 접두사"
                                />
                            </th>
                            <td>
                                <spring:message
                                    code="prefix_des"
                                    text="접두사는 주요 사용자를 분류합니다"
                                />
                            </td>
                        </tr>
                        <tr>
                            <th width="180">
                                <spring:message
                                    code="user_status"
                                    text="사용자 상태"
                                />
                            </th>
                            <td>
                                <spring:message
                                    code="status_des"
                                    text="사용자 분류에 사용"
                                />
                            </td>
                        </tr>
                        <tr>
                            <th width="180">
                                <spring:message
                                    code="schedule"
                                    text="크론 스케쥴"
                                />
                            </th>
                            <td>
                                <spring:message
                                    code="schedule_des"
                                    text="마이그레이션 작업 실행 타이밍 구성"
                                />
                            </td>
                        </tr>
                        <tr v-if="option == 1">
                            <th width="180">
                                <spring:message
                                    code="custom_column"
                                    text="사용자 정의 열"
                                />
                            </th>
                            <td>
                                <spring:message
                                    code="custom_column_des"
                                    text="기본 카테고리 이외의 추가 정보를 연결할 때 사용"
                                />
                            </td>
                        </tr>
                        <tr v-if="option == 1">
                            <th width="180">
                                <spring:message
                                    code="query"
                                    text="쿼리입력(SQL)"
                                />
                            </th>
                            <td>
                                <spring:message
                                    code="query_des"
                                    text="마이그레이션해야 하는 사용자 정보를 가져오는 쿼리"
                                />
                            </td>
                        </tr>
                        <tr v-if="option == 2">
                            <th width="180">
                                <spring:message
                                    code="file_path"
                                    text="파일 경로"
                                />
                            </th>
                            <td>
                                <spring:message
                                    code="file_path_des"
                                    text="폴더 경로에는 사용자 정보 파일이 포함되어 있습니다"
                                />
                            </td>
                        </tr>
                        <tr v-if="option == 2">
                            <th width="180">
                                <spring:message
                                    code="file_backup_path"
                                    text="파일 백업 경로"
                                />
                            </th>
                            <td>
                                <spring:message
                                    code="backup_path_des"
                                    text="마이그레이션 실행 후 파일이 이동할 폴더 경로"
                                />
                            </td>
                        </tr>
                    </tbody>
                </table>
            </div>

            <div class="modal-save text-center m-t-20">
                <div
                    class="btn btn-darkgray m-r-5 text-center"
                    data-dismiss="modal"
                >
                    <spring:message code="close" text="닫다" />
                </div>
            </div>
        </div>
    </div>
</div>
<!-- Config Intro Modal - End -->


<!-- Job Error Modal -->
<div
    class="modal fade"
    id="jobError"
    tabindex="-1"
    role="dialog"
    aria-labelledby="myModalLabel"
    aria-hidden="true"
>
    <div class="modal-dialog modal-1000">
        <div class="modal-content">
            <div class="modal-header panel-heading">
                <button type="button" class="close" data-dismiss="modal">
                    <span aria-hidden="true"></span>
                    <span class="sr-only">Close</span>
                </button>
                <h4>
                    <spring:message code="job_error" text="마이그레이션 오류" />
                </h4>
            </div>
            <!-- 타이틀 -->

            <div class="modal-body panel-body">
                {{ message }}
            </div>

            <div class="modal-save text-center m-t-20">
                <div
                    class="btn btn-darkgray m-r-5 text-center"
                    data-dismiss="modal"
                >
                    <spring:message code="close" text="닫다" />
                </div>
            </div>
        </div>
    </div>
</div>
<!-- Job Error Modal - End -->

<!-- Step change confirm modal -->
<div
    class="modal fade"
    id="confirmModal"
    tabindex="-1"
    role="dialog"
    aria-labelledby="myModalLabel"
    aria-hidden="true"
>
    <div class="modal-dialog modal-800 modal-cron" style="position: absolute; left: 25%; right: 25%;">
        <div class="modal-content">
            <div class="modal-header panel-heading">
                <button type="button" class="close" data-dismiss="modal">
                    <span aria-hidden="true"></span>
                    <span class="sr-only">Close</span>
                </button>
                <h4>
                    <spring:message code="cancel" text="Alert" />
                </h4>
            </div>
            <!-- 타이틀 -->

            <div class="modal-body panel-body" style="font-size: 15px;" id="confirmContentText">
                {{ message }}
            </div>

            <div class="modal-save text-center m-t-20 modal-footer-custom">
                <div
                class="btn btn-darkgray text-center"
                id="modalCancelBtn"
                style="grid-column: 2;"
                >
                    <spring:message code="cancel" text="취소" />
                </div>
                <div
                    class="btn btn-red text-center"
                    id="modalConfirmBtn"
                    style="grid-column: 4;"
                >
                    <spring:message code="proceed" text="Proceed" />
                </div>
            </div>
        </div>
    </div>
</div>
<!-- Step change confirm modal - End -->


<!-- Alias Intro modal -->
<div
    class="modal fade"
    id="aliasIntroModal"
    tabindex="-1"
    role="dialog"
    aria-labelledby="myModalLabel"
    aria-hidden="true"
>
    <div class="modal-dialog modal-800 modal-cron" style="position: absolute; right: 25%; left: 25%;">
        <div class="modal-content">
            <div class="modal-header panel-heading">
                <button type="button" class="close" data-dismiss="modal">
                    <span aria-hidden="true"></span>
                    <span class="sr-only">Close</span>
                </button>
                <h4>
                    Alias Information
                </h4>
            </div>
            <!-- 타이틀 -->

            <div class="modal-body panel-body">
                <div  style="position: relative; width: 100%; ">
                        <img src="${_contextPath}/img/alias_info.png" style="width:100%; height: 500px;">
                </div>
            </div>

            <div class="modal-save m-t-20 modal-footer-custom">
                <div
                    class="btn btn-darkgray text-center"
                    style="grid-column: 3;"
                    data-dismiss="modal"
                >
                    <spring:message code="close" text="닫다" />
                </div>

            </div>
        </div>
    </div>
</div>
<!-- Alias Intro modal - End -->


<!-- Cron schedule Modal -->
<div
    class="modal fade"
    id="cronModal"
    tabindex="-1"
    role="dialog"
    aria-labelledby="myModalLabel"
    aria-hidden="true"
>
    <div class="modal-dialog modal-1000 modal-cron">
        <div class="modal-content">
            <div class="modal-header panel-heading">
                <button type="button" class="close" data-dismiss="modal">
                    <span aria-hidden="true"></span>
                    <span class="sr-only">Close</span>
                </button>
                <h4>
                    <spring:message code="user-migration-cron-scheduler" text="Cron Scheduler" />
                </h4>
            </div>
            <div class="modal-body panel-body">
                <table class="table table-bordered" style="margin-inline: auto; width:650px; max-width: none;" >
                    <tr>
                        <th> <input type="radio" id="minuteRadio" name="frequency" @click="selectTab(1)"> <spring:message code="minute" text="Minute" /> </th>
                        <th> <input type="radio" id="hourRadio" name="frequency" @click="selectTab(2)"> <spring:message code="hour" text="Hour" /> </th>
                        <th> <input type="radio" id="dateOfMonthRadio" name="frequency" @click="selectTab(3)"> <spring:message code="user-migration-date-of-month" text="Date of Month" /> </th>
                        <th> <input type="radio" id="monthRadio" name="frequency" @click="selectTab(4)"> <spring:message code="month" text="Month" /> </th>
                        <th> <input type="radio" id="dateOfWeekRadio" name="frequency" @click="selectTab(5)"> <spring:message code="user-migration-date-of-week" text="Date of Week" /> </th>
                    </tr>
                    <tr>
                        <td colspan="5" v-if="fieldSelected.minuteSelected"> 
        
                            Every &nbsp; <span> <input type="text" v-model="minuteInput" :class="{ 'invalid-input':  userPrompt.notZeroPrompt }" /> </span> (s)
                            <div v-if="userPrompt.notZeroPrompt"> 
                                <b style="color: red;">
                                     <spring:message code="user-migration-minute-alert" text="Please enter a positive integer between 1 and 59" />                               
                                </b>
                            </div>
                        </td>
                        <td colspan="5" v-if="fieldSelected.hourSelected"> 
                            Every &nbsp; <span> <input type="text" v-model="hourInput" :class="{ 'invalid-input':  userPrompt.notZeroPrompt }" /> 
                            hour(s) </span> on minute
                            <span> <input type="text" v-model="minuteInput" :class="{ 'invalid-input': userPrompt.minutePrompt  }" /> </span>
                            <div v-if="userPrompt.notZeroPrompt"> 
                                <b style="color: red;"> 
                                    <spring:message code="user-migration-hour-alert" text="Please enter a positive integer between 1 and 23" />
                                </b>
                            </div>
                            <div v-if="userPrompt.minutePrompt">
                                <b style="color: red;" > 
                                    <spring:message code="user-migration-minute-normal-alert" text="Please enter an integer between 0 and 59" />  
                                </b>
                            </div>
                        </td>
                        <td colspan="5" v-if="fieldSelected.dateOfMonthSelected"> 
                            Every &nbsp; <span> <input type="text" v-model="dateOfMonthInput" :class="{ 'invalid-input': userPrompt.dateOfMonthPrompt }"/> 
                            day(s) </span> at 
                            &nbsp; <input type="time" id="time" value="00:00" v-model="hourMinuteInput">
                            <div v-if="userPrompt.dateOfMonthPrompt">
                                <b style="color: red;"> 
                                    <spring:message code="user-migration-date-of-month-alert" text="Please enter an integer between 1 and 31" />                                   
                                </b>
                            </div>
                        </td>
                        <td colspan="5" v-if="fieldSelected.monthSelected"> 
                            On the &nbsp; <span> <input type="text" v-model="dateOfMonthInput" :class="{ 'invalid-input': userPrompt.dateOfMonthPrompt }" /> day </span>, of every &nbsp;
                            <span> <input type="text" v-model="monthInput" :class="{ 'invalid-input': userPrompt.monthPrompt }" /> month </span> at 
                            &nbsp; <input type="time" id="time" value="00:00" v-model="hourMinuteInput">
                            <div v-if="userPrompt.dateOfMonthPrompt">
                                <b style="color: red;"> 
                                    <spring:message code="user-migration-date-of-month-alert" text="Please enter an integer between 1 and 31" />  
                                </b>
                            </div>
                            <div v-if="userPrompt.monthPrompt">
                                <b style="color: red;"> 
                                    <spring:message code="user-migration-month-alert" text="Please enter an integer between 1 and 12" />  
                                </b>
                            </div>
                        </td>
                        <td colspan="5" v-if="fieldSelected.dateOfWeekSelected"> 
                            Every &nbsp; 
                            <span v-for="(label, index) in dateOfWeekLabel" :key="index"> 
                                <input type="checkbox" :value="index+1" :id="label" v-model="dateOfWeekInput" />  
                                <label :for="label" > {{ label }} </label> &nbsp;
                            </span> 
                        at &nbsp; <input type="time" id="time1" value="00:00" v-model="hourMinuteInput">
                        </td>
                    </tr>
                    <tr>
                        <th colspan="5" style="text-align: center;"> <spring:message code="user-migration-your-generated-cron-expression" text="Your Generated Cron Expression" /> </th>
                    </tr>
                    <tr>
                        <td colspan="5" v-if="showCron"  
                        style="text-align: center;">
                            {{ cronQuartzGenerated }}
                        </td>
                    </tr>
                </table>
            </div>
            <div class="modal-save text-center m-t-20">
                <div
                class="btn btn-red common-button"
                style="width: auto"
                @click="saveCron()"
                >
                    <spring:message code="save" text="저장" />
                </div>
            </div>
        </div>
    </div>
</div> 
<!-- Disable Configuration Popup Form -->
<div
    class="modal fade"
    id="disableConfirmPopup"
    tabindex="-1"
    role="dialog"
    aria-labelledby="myModalLabel"
    aria-hidden="true"
>
    <div class="modal-dialog modal-450">
        <div class="modal-content">
            <div class="modal-header panel-heading">
                <button type="button" class="close" data-dismiss="modal">
                    <span aria-hidden="true"></span>
                    <span class="sr-only">Close</span>
                </button>
                
                <h4>
                    <spring:message
                        code="confirm-title"
                        text="Confirmation"
                    />
                </h4>
            </div>

            <div class="modal-body panel-body">
                <spring:message
                    code="user-migration-confirm-disable-ask-content"
                    text="Are you sure that you want to disable this configuration?"
                />
            </div>
            <!-- 내용 | Content -->

            <div class="modal-footer">
                <div class="line"></div>
                <!-- 취소 | Cancel -->
                <div class="btn btn-gray p-w-35" data-dismiss="modal">
                    <spring:message
                        code="cancel"
                        text="Cancel"
                    />                    
                </div>
                <!-- 삭제 | Confirm -->
                <div class="btn btn-red p-w-35" @click="disableConfig()">
                    <spring:message
                        code="proceed"
                        text="OK"
                    />
                </div>
            </div>
        </div>
    </div>
</div>
<!-- Disable Configuration Popup Form -->
<script type="text/JavaScript" src="${_contextPath}/js/lodash.min.js"></script>
<script src="${_contextPath}/js/plugins/bootstrap-select/bootstrap-select.js?v=${commonEtcData.PRDVER.prd_date }"></script>
<script src="${_contextPath}/js/configuration/user-migration-vue.js?v=${commonEtcData.PRDVER.prd_date }"></script>
<script src="https://cdnjs.cloudflare.com/ajax/libs/crypto-js/4.1.1/crypto-js.min.js"></script>
