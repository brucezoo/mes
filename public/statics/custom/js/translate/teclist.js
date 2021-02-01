var translate = window.sessionStorage.getItem('tra');
var left = translate.split(",");
var trs = ` <option id="listOne" value='${left[0]}'>${left[1]}</option>`;
$('#list').append(trs);

var str = {
	page_no: '1',
	page_size: '20',
	languageCode: left[0],
}

// 翻译
$('#translate').on('click', function () {
	str = {
		page_no: '1',
		page_size: '20',
		languageCode: $('#list').val(),
	}
	getCount();
})

//  导入
layui.use('upload', function () {
	var $ = layui.jquery
		, upload = layui.upload;

	upload.render({
		elem: '#test8'
		, url: '/Language/importProcedureRouteExcel'
		, auto: false
		, data: { '_token': '8b5491b17a70e24107c89f37b1036078' }
		//,multiple: true
		, accept: 'file'
		, bindAction: '#test9'
		, beforeSend: function () {
			layerLoading = layer.load(0, { shade: [0.3, '#bbb'] });
		}
		, done: function (rsp) {
			// console.log(rsp);
			if (rsp.code == 202) {
				let data = rsp.results;
				let string = '';
				data.forEach(item => {
					string = item + ',' + string;
				});
				layer.alert(string + '编码没有维护!');
			} else {
				layer.msg('上传成功！', { time: 3000, icon: 1 });
				getCount();
			}

		}
		, error: function () {
			layer.msg('上传失败！', { time: 3000, icon: 5 });
		}
	});

})

// 获取 国家 数据
getTranslate();
function getTranslate() {
	AjaxClient.get({
		url: URLS['translate'].get + "?" + _token,
		dataType: 'json',
		fail: function (res) {
			let datas = res.results;
			for (let i = 0; i < datas.length; i++) {
				let option = `
                    <option value="${datas[i].code}" >${datas[i].name}</option>
                `;
				$('#list').append(option);
			}
		}
	}, this)
}

getCount();
// 获取总数量
function getCount() {
	AjaxClient.get({
		url: '/Language/getProcedureRouteLanguage' + '?' + _token + '&page_no=' + str.page_no + '&page_size=' + str.page_size + '&languageCode=' + str.languageCode,
		dataType: 'json',
		fail: function (rsp) {
			page(rsp.total_records);
		},
	}, this);
}


function page(count) {
	layui.use(['laypage', 'layer'], function () {
		var laypage = layui.laypage
			, layer = layui.layer;

		laypage.render({
			elem: 'demo2-1'
			, count: count
			, theme: '#FF5722'
			, limit: str.page_size
			, jump: function (obj) {
				str.page_no = obj.curr;
				str.page_size = 20;
				getList();
			}
		});


	});
}

// 获取 主列表 数据
function getList() {
	$('#tbody').html('');
	AjaxClient.get({
		url: '/Language/getProcedureRouteLanguage' + '?' + _token + '&page_no=' + str.page_no + '&page_size=' + str.page_size + '&languageCode=' + str.languageCode,
		dataType: 'json',
		beforeSend: function () {
			layerLoading = layer.load(0, { shade: [0.3, '#bbb'] });
		},
		fail: function (rsp) {
			layer.close(layerLoading);
			let data = rsp.results;
			// console.log(data);
			for (let i = 0; i < data.length; i++) {
				let tr = getTr(data[i]);
				$('#tbody').append(tr);
			}
			window.localStorage.setItem('ch', JSON.stringify(data));
			choice();
		},
	}, this);
}

function getTr(data) {
	let tr = `
        <tr>
            <td><input type="checkbox" data-id='${data.rprId}'  class = "input"></td>
            <td>${data.rprcode}</td>
            <td>${data.rprName}</td>
			<td><input type="text" id="lName" value="${data.lanName == null ? '' : data.lanName} "></td>
        </tr>
    `;

	return tr;
}


function choice() {
	let check = $('#tbody .input');
	document.getElementById('choice').checked = false;
	$('#choice').on('click', function () {
		if (document.getElementById('choice').checked != true) {
			for (let i = 0; i < check.length; i++) {
				check[i].checked = false;
			}
		} else {
			// 全选 
			for (let i = 0; i < check.length; i++) {
				check[i].checked = true;
			}
		}
	})
}

// 一键保存
$('#save').on('click', function () {
	let check = $('#tbody .input');
	let arr = [];
	var st = {
		rprId: '',
		languageCode: '',
		name: '',
	}
	let date = JSON.parse(window.localStorage.getItem('ch'));

	for (let i = 0; i < check.length; i++) {
		if (check[i].checked == true) {
			st = {
				rprId:$(check[i]).attr('data-id'),
				languageCode: $('#list').val(),
				name: $(check[i]).parent().parent().find('#lName').val(),
			}
			arr.push(st);
		}
	}
	if (arr.length != 0) {
		let datas = {
			string: JSON.stringify(arr),
		}

		AjaxClient.post({
			url: '/Language/procedureRouteLanguage' + '?' + _token,
			dataType: 'json',
			data: datas,
			success: function (rsp) {
				layer.msg('保存成功！', { time: 3000, icon: 1 });
				for (let i = 0; i < check.length; i++) {
					check[i].checked = false;
				}
				arr = [];
				getCount();
			},
			fail: function (rsp) {
				layer.msg('保存失败！', { time: 3000, icon: 5 });
			}
		}, this);
	} else {
		layer.msg('请先勾选再保存！', { time: 3000, icon: 5 });
	}
})

// 导出
$('#printOut').on('click', function () {
	let check = $('#tbody .input');
	let string = '';
	let languageCode = '';
	let data = '';
	let date = JSON.parse(window.localStorage.getItem('ch'));

	const res = new Promise(function (resolve, reject) {
		let a = [];
		for (let i = 0; i < check.length; i++) {
			if (check[i].checked == true) {
				a.push($(check[i]).attr('data-id'));
			}
		}
		resolve(a);
	})

	res.then(function (a) {

		console.log(a);
		if (a != '') {
			string = a[0];
			for (let j = 1; j < a.length; j++) {
				string = string + ',' + a[j];
			}
			languageCode = $('#list').val();
			data = string;
		} else {

			languageCode = $('#list').val();
			data = '';
		}

		$('#printOuta').attr('href', '/Language/exportProcedureRouteExcel? _token = 8b5491b17a70e24107c89f37b1036078' + '&data=' + data + '&languageCode=' + languageCode)
	})
})

//  添加能力
$('#ability').on('click', function () {
	getProcedureCode();
});

function getProcedureCode() {
	AjaxClient.post({
		url: URLS['procedure'].getCode,
		dataType: 'json',
		data: {
			_token: TOKEN,
			type_code: '',
			type: 5
		},
		beforeSend: function () {
			layerLoading = LayerConfig('load');
		},
		success: function (rsp) {
			layer.close(layerLoading);
			procedureModal(0, 'add', rsp.results);
		},
		fail: function (rsp) {
			layer.close(layerLoading);
			if (rsp && rsp.message != undefined && rsp.message != null) {
				LayerConfig('fail', rsp.message);
			}
		}
	}, this);
}

function procedureModal(ids, flag, data) {

	var { id = '', code = '', name = '', desc = '', ability = [], practice_field = [], is_excrete = '', is_ipqc = '', is_oqc = '', sap_identification = '' } = {};
	if (data) {
		({ id='', code='', name='', desc='', ability=[], practice_field=[], is_excrete='', is_ipqc='', is_oqc='', sap_identification='' } = data);
	}


	var labelWidth = 100, readonly = '', title = "查看工序", btnShow = 'btnShow', placeholder = "请输入描述，最多能输入500个字符", noEdit = '', disabled = '', sapPlaceholder = '请输入SAP标识';

	flag == 'view' ? (readonly = 'readonly="readonly"', btnShow = 'btnHide', placeholder = '', sapPlaceholder = '') : (flag == 'add' ? title = '添加工序' : (title = '编辑工序', noEdit = 'readonly="readonly"'));

	layerModal = layer.open({
		type: 1,
		title: title,
		offset: '100px',
		area: '500px',
		shade: 0.1,
		shadeClose: false,
		resize: false,
		content: `<form class="addProcedureModal abilityModal formModal formMateriel" id="addProcedureModal_form" data-flag="${flag}">
                     <input type="hidden" id="itemId" value="${ids}">
                     <div style="max-height: 480px; overflow-y: auto; padding-right: 12px;">
                     <div class="el-form-item">
                        <div class="el-form-item-div">
                            <label class="el-form-item-label" style="width: ${labelWidth}px;">工序编码<span class="mustItem">*</span></label>
                            <input type="text" id="code" ${readonly} ${noEdit} data-name="编码" class="el-input" placeholder="请输入编码" value="${code}">
                        </div>
                        <p class="errorMessage" style="padding-left: ${labelWidth}px;"></p>
                    </div>
                     <div class="el-form-item">
                        <div class="el-form-item-div">
                            <label class="el-form-item-label" style="width: ${labelWidth}px;">工序名称<span class="mustItem">*</span></label>
                            <input type="text" id="name" ${readonly} data-name="工序名称" class="el-input" placeholder="请输入工序名称" value="${name}">
                        </div>
                        <p class="errorMessage" style="padding-left: ${labelWidth}px;"></p>
                    </div>
                     <div class="el-form-item abilitySelect">
                        <div class="el-form-item-div">
                            <label class="el-form-item-label" style="width: ${labelWidth}px;">能力</label>
                            <div class="el-select-dropdown-wrap">
                                <div class="el-select ${flag == 'view' ? 'ability' : ''}">
                                    <i class="el-input-icon el-icon el-icon-caret-top"></i>
                                    <div style="padding-right: 35px;" class="selectValue ability">
                                        <span class="kong">--请选择--</span>
                                    </div>
                                    <input type="hidden" class="val_id" id="abilityProcedure" value="">
                                </div>
                                <div style="position: absolute;" class="el-select-dropdown">
                                    <ul class="el-select-dropdown-list">
                                        <li data-id="" class="el-select-dropdown-item kong proceDisabled" data-name="--请选择--">--请选择--</li>
                                       
                                    </ul>
                                </div>
                            </div>
                        </div>
                        <p class="ability errorMessage" style="padding-left: ${labelWidth}px;"></p>
                    </div>
                    <div class="el-form-item">
                        <div class="el-form-item-div">
                            <label class="el-form-item-label" style="width: ${labelWidth}px;">SAP标识</label>
                            <input type="text" id="sap_identification" ${readonly} data-name="SAP标识" class="el-input" placeholder="${sapPlaceholder}" value="${sap_identification}">
                        </div>
                        <p class="errorMessage" style="padding-left: ${labelWidth}px;"></p>
                    </div>
                    <div class="el-form-item practiceSelect">
                        <div class="el-form-item-div">
                            <label class="el-form-item-label" style="width: ${labelWidth}px;">做法字段</label>
                            <div class="el-select-dropdown-wrap">
                                <div class="el-select ${flag == 'view' ? 'practice_field' : ''}">
                                    <i class="el-input-icon el-icon el-icon-caret-top"></i>
                                    <div style="padding-right: 35px;" class="selectValue practice">
                                        <span class="kong">--请选择--</span>
                                    </div>
                                    <input type="hidden" class="val_id" id="practiceProcedure" value="">
                                </div>
                                <div style="position: absolute;" class="el-select-dropdown">
                                    <ul class="el-select-dropdown-list">
                                        <li data-id="" class="el-select-dropdown-item kong proceDisabled" data-name="--请选择--">--请选择--</li>
                                   
                                    </ul>
                                </div>
                            </div>
                            <!--<div class="tags selectValue" id="tags" tabindex="1"> -->
                                <!--&lt;!&ndash;<span class="tag"></span> &ndash;&gt;-->
                                <!--<input id="form-field-tags" type="text" placeholder="Enter tags ..." value="Tag Input Control" name="tags" style="display: none;"/> -->
                                <!--<input type="text" placeholder="输入能力" class="tags_enter" autocomplete="off"/> -->
                            <!--</div> -->
                        </div>
                        <p class="practice errorMessage" style="padding-left: ${labelWidth}px;"></p>
                    </div>
                    <div class="el-form-item">
						<div class="el-form-item-div">
							<label class="el-form-item-label" style="width: ${labelWidth}px;">启用拆分</label>
							<div class="el-radio-group" style="width: 100%">
								<label class="el-radio">
									<span class="el-radio-input yes is_excrete is-radio-checked">
										<span class="el-radio-inner"></span>
										<input class="is_excrete" type="hidden" value="1">
									</span>
									<span class="el-radio-label">是</span>
								</label>
								<label class="el-radio">
									<span class="el-radio-input no is_excrete">
										<span class="el-radio-inner"></span>
										<input class="is_excrete" type="hidden" value="0">
									</span>
									<span class="el-radio-label">否</span>
								</label>
							</div>    
						</div>
					</div>  
					<div class="el-form-item">
						<div class="el-form-item-div">
							<label class="el-form-item-label" style="width: ${labelWidth}px;">IPQC检验</label>
							<div class="el-radio-group" style="width: 100%">
								<label class="el-radio">
									<span class="el-radio-input yes is_ipqc ">
										<span class="el-radio-inner"></span>
										<input class="is_ipqc" type="hidden" value="1">
									</span>
									<span class="el-radio-label">是</span>
								</label>
								<label class="el-radio">
									<span class="el-radio-input no is_ipqc is-radio-checked">
										<span class="el-radio-inner"></span>
										<input class="is_ipqc" type="hidden" value="0">
									</span>
									<span class="el-radio-label">否</span>
								</label>
							</div>    
						</div>
					</div>
					<div class="el-form-item">
						<div class="el-form-item-div">
							<label class="el-form-item-label" style="width: ${labelWidth}px;">OQC检验</label>
							<div class="el-radio-group" style="width: 100%">
								<label class="el-radio">
									<span class="el-radio-input yes is_oqc ">
										<span class="el-radio-inner"></span>
										<input class="is_oqc" type="hidden" value="1">
									</span>
									<span class="el-radio-label">是</span>
								</label>
								<label class="el-radio">
									<span class="el-radio-input no is_oqc is-radio-checked">
										<span class="el-radio-inner"></span>
										<input class="is_oqc" type="hidden" value="0">
									</span>
									<span class="el-radio-label">否</span>
								</label>
							</div>    
						</div>
					</div>       
                     <div class="el-form-item">
                        <div class="el-form-item-div">
                            <label class="el-form-item-label" style="width: ${labelWidth}px;">描述</label>
                            <textarea type="textarea" ${readonly} maxlength="500" id="description" rows="5" class="el-textarea" placeholder="${placeholder}">${desc}</textarea>
                        </div>
                        <p class="errorMessage"></p>
                    </div>
                    </div>
                    <div class="el-form-item ${btnShow}">
                        <div class="el-form-item-div btn-group">
                            <button type="button" class="el-button cancle">取消</button>
                            <button type="button" class="el-button el-button--primary submit ${flag}">确定</button>
                        </div>
                    </div>
                </form>`,
		success: function (layero) {
			layerEle = layero;
			// getLayerSelectPosition($(layero));
			getAbilitySource(ability, flag);
			getPracticeSource(practice_field, flag);
			if (is_excrete == 0) {
				$('.is_excrete.no').addClass('is-radio-checked');
				$('.is_excrete.yes').removeClass('is-radio-checked')
			} else {
				$('.is_excrete.no').removeClass('is-radio-checked');
				$('.is_excrete.yes').addClass('is-radio-checked');
			}
			if (is_ipqc == 0) {
				$('.is_ipqc.no').addClass('is-radio-checked');
				$('.is_ipqc.yes').removeClass('is-radio-checked')
			} else {
				$('.is_ipqc.no').removeClass('is-radio-checked');
				$('.is_ipqc.yes').addClass('is-radio-checked');
			}
			if (is_oqc == 0) {
				$('.is_oqc.no').addClass('is-radio-checked');
				$('.is_oqc.yes').removeClass('is-radio-checked')
			} else {
				$('.is_oqc.no').removeClass('is-radio-checked');
				$('.is_oqc.yes').addClass('is-radio-checked');
			}
			if (flag !== 'view') {
				//单选按钮点击事件
				$('body').on('click', '.formMateriel:not(".disabled") .el-radio-input', function (e) {
					$(this).parents('.el-radio-group').find('.el-radio-input').removeClass('is-radio-checked');
					$(this).addClass('is-radio-checked');
				});
			} else {
				$('.el-radio-group').css('pointer-events', 'none');
			}
		},
		end: function () {
			$('.uniquetable tr.active').removeClass('active');
		}
	})
}

// 取消
$('body').on('click', '.formMateriel:not(".disabled") .cancle', function (e) {
	e.stopPropagation();
	layer.close(layerModal);
});

// 确定
$('body').on('click', '.submit', function () {
	var parentForm = $(this).parents('#addProcedureModal_form'),
		id = parentForm.find('#itemId').val(),
		flag = parentForm.attr("data-flag"), abilityTag = 1;
	produceTag = 1;

	var _select = $('.selectValue .proceTip.ability'), ability_string = [], ability_id = [];
	// console.log(_select.length)
	if (_select.length) {
		abilityTag = 1;
		$('.abilitySelect .errorMessage').html('');
		$(_select).each(function (k, v) {
			ability_string.push($(v).text());
			ability_id.push($(v).attr('data-id'))
		})
	} else {

		ability_string = [];
		ability_id = [];
	}

	var _selectP = $('.selectValue.practice .proceTip.practice'), practice_string = [], practice_id = [];
	// console.log(_selectP.length)
	if (_selectP.length) {
		practiceTag = 1;
		$('.practiceSelect .errorMessage').html('');
		$(_selectP).each(function (k1, v1) {
			practice_string.push($(v1).text());
			practice_id.push($(v1).attr('data-id'))
		})
	} else {

		practice_string = [];
		practice_id = [];
	}

	for (var type in validatorConfig) { validatorToolBox[validatorConfig[type]](type, flag, id) }

	if (nameCorrect && codeCorrect && abilityTag) {
		if (!$(this).hasClass('is-disabled')) {
			$(this).addClass('is-disabled');
			parentForm.addClass('disabled');

			var name = parentForm.find('#name').val().trim(),
				code = parentForm.find('#code').val().trim(),
				is_excrete = parentForm.find('.is-radio-checked .is_excrete').val(),
				is_ipqc = parentForm.find('.is-radio-checked .is_ipqc').val(),
				is_oqc = parentForm.find('.is-radio-checked .is_oqc').val(),
				sap_identification = parentForm.find('#sap_identification').val().trim(),
				description = parentForm.find('#description').val().trim();

			$(this).hasClass('edit') ? editProcedureData({
				operation_id: id,
				name: name,
				code: code,
				sap_identification: sap_identification,
				ability_string: ability_string.join(','),
				ability_id: ability_id.join(','),
				practice_string: practice_string.join(','),
				practice_field_id_str: practice_id.join(','),
				is_excrete: is_excrete,
				is_ipqc: is_ipqc,
				is_oqc: is_oqc,
				desc: description,
				_token: TOKEN
			}) :
				addProcedureData({
					name: name,
					code: code,
					sap_identification: sap_identification,
					ability_string: ability_string.join(','),
					ability_id: ability_id.join(','),
					practice_string: practice_string.join(','),
					practice_field_id_str: practice_id.join(','),
					is_excrete: is_excrete,
					is_ipqc: is_ipqc,
					is_oqc: is_oqc,
					desc: description,
					_token: TOKEN
				})
		}
	}
})

function addProcedureData(data) {
	AjaxClient.post({
		url: URLS['procedure'].procedureAdd,
		dataType: 'json',
		data: data,
		beforeSend: function () {
			layerLoading = LayerConfig('load');
		},
		success: function (rsp) {
			layer.close(layerLoading);
			layer.close(layerModal);
			getCount();
		},
		fail: function (rsp) {
			layer.close(layerLoading);
			if (rsp && rsp.message != undefined && rsp.message != null) {
				LayerConfig('fail', rsp.message)
			}
			$('body').find('#addProcedureModal_form').removeClass('disabled').find('.submit').removeClass('is-disabled');

			// if (rsp && rsp.field !== undefined) {
			//     showInvalidMessage(rsp.field, rsp.message);
			// }

		}
	}, this)
}


