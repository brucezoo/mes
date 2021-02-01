var translate = window.localStorage.getItem('translate');
var left = translate.split(",");
var trs = ` <option id="listOne" value='${left[0]}'>${left[1]}</option>`;
$('#list').append(trs);

var str = {
    page_no: '1',
    page_size: '20',
    languageCode: left[0],
}

// 翻译
$('#translate').on('click', function() {
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
        , url: '/Language/importExcel'
        , auto: false
        , data: { '_token': '8b5491b17a70e24107c89f37b1036078' }
        //,multiple: true
        , accept: 'file'
        , bindAction: '#test9'
        , beforeSend: function () {
            layerLoading = layer.load(0, { shade: [0.3, '#bbb'] });
        }
        , done: function (rsp) {
            console.log(rsp);
            if(rsp.code == 202) {
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
        url: URLS['ability'].getAbility + '?' + _token + '&page_no='+ str.page_no + '&page_size='+ str.page_size + '&languageCode=' + str.languageCode,
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
                // console.log(obj.curr);
                getList();
            }
        });
      

    });
}

// 获取 主列表 数据
function getList() {
    $('#tbody').html('');
    AjaxClient.get({
        url: URLS['ability'].getAbility + '?' + _token + '&page_no=' + str.page_no + '&page_size=' + str.page_size + '&languageCode=' + str.languageCode,
        dataType: 'json',
        beforeSend: function () {
            layerLoading = layer.load(0, { shade: [0.3, '#bbb'] });
        },
        fail: function (rsp) {
            layer.close(layerLoading);
            let data = rsp.results;
            for(let i=0; i<data.length; i++) {
                let tr = getTr(data[i]);
                $('#tbody').append(tr);
            }
            window.localStorage.setItem('choice',JSON.stringify(data));
            choice();
        },
    }, this);
}

function getTr(data) {

    let tr = `
        <tr>
            <td><input type="checkbox" class = "input"></td>
            <td>${data.code}</td>
            <td>${data.abilityName}</td>
            <td><input type="text" id="lName" value="${data.languageName == null ? '' : data.languageName} "></td>
            <td>${data.abilityDescription}</td>
            <td><input type="text" id="lDes" value="${data.languageDescription == null ? '' : data.languageDescription }"></td>
        </tr>
    `;

    return tr;
}


function choice() {
    let check = $('#tbody .input');
    document.getElementById('choice').checked = false;
    $('#choice').on('click', function() {
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
        abilityId: '',
        languageCode: '',
        name: '',
        description: '',
    }
    let date = JSON.parse(window.localStorage.getItem('choice'));

    for (let i = 0; i < check.length; i++) {
        if (check[i].checked == true) {
            console.log(check[i].checked);
            st = {
                abilityId: date[i].abilityId,
                languageCode: $('#list').val(),
                name: $('#lName').val(),
                description: $('#lDes').val()
            }
            arr.push(st);
        }
    }
    if (arr.length != 0) {
        let datas = {
            string: JSON.stringify(arr),
        }
        AjaxClient.post({
            url: URLS['ability'].save + '?' + _token,
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
    let date = JSON.parse(window.localStorage.getItem('choice'));

    const res = new Promise(function (resolve, reject) {
        let a = [];
        for (let i = 0; i < check.length; i++) {
            if (check[i].checked == true) {
                a.push(date[i].abilityId);
            }
        }
        resolve(a);
    })

    res.then(function (a) {
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

        $('#printOuta').attr('href', '/Language/exportExcel? _token = 8b5491b17a70e24107c89f37b1036078' + '&data=' + data + '&languageCode=' + languageCode)
    })
})


//  添加能力
$('#ability').on('click', function() {
    getAilityCode();
});

function getAilityCode() {
    AjaxClient.post({
        url: URLS['procedure'].getCode,
        dataType: 'json',
        data: {
            _token: TOKEN,
            type_code: '',
            type: 4
        },
        beforeSend: function () {
            layerLoading = LayerConfig('load');
        },
        success: function (rsp) {
            layer.close(layerLoading);
            // rsp.results.code = '';
            // console.log(rsp.results);
            showAbilityModal('add', 0, rsp.results)
        },
        fail: function (rsp) {
            layer.close(layerLoading);
            if (rsp && rsp.message != undefined && rsp.message != null) {
                LayerConfig('fail', rsp.message);
            }
        }
    }, this);
}

function showAbilityModal(flag, ids, data) {
    var { code = '', name = '', description = '' } = {};
    if (data) {
        ({ code='', name='', description='' } = data)
    }

    var labelWidth = 100, title = '查看能力', btnShow = 'btnShow', readonly = '', noEdit = '';

    flag === 'view' ? (btnShow = 'btnHide', readonly = 'readonly="readonly"') : (flag === 'edit' ? (title = '编辑能力', noEdit = 'readonly="readonly"') : (title = '添加能力', code = ''));

    layerModal = layer.open({
        type: 1,
        title: title,
        offset: '100px',
        area: '500px',
        shade: 0.1,
        shadeClose: true,
        resize: false,
        move: false,
        content: `<form class="addAbility formModal formMateriel" id="addAbility_form" data-flag="${flag}">
                <input type="hidden" id="itemId" value="${ids}">
                <div class="el-form-item">
                    <div class="el-form-item-div">
                        <label class="el-form-item-label" style="width: ${labelWidth}px;">编码<span class="mustItem">*</span></label>
                        <input type="text" id="code" ${noEdit} ${readonly} value="${code}" data-name="编码" class="el-input" placeholder="请输入编码">
                    </div>
                    <p class="errorMessage" style="padding-left: ${labelWidth}px;"></p>
                </div>
                <div class="el-form-item">
                    <div class="el-form-item-div">
                        <label class="el-form-item-label" style="width: ${labelWidth}px;">名称<span class="mustItem">*</span></label>
                        <input type="text" id="name" ${readonly} value="${name}" data-name="名称" class="el-input" placeholder="请输入名称">
                    </div>
                    <p class="errorMessage" style="padding-left: ${labelWidth}px;"></p>
                </div>
                <div class="el-form-item">
                    <div class="el-form-item-div">
                        <label class="el-form-item-label" style="width: ${labelWidth}px;">描述</label>
                        <textarea type="textarea" maxlength="500" ${readonly} id="desc" rows="5" class="el-textarea" placeholder="${flag == 'view' ? '' : '请输入注释，最多只能输入500字'}">${tansferNull(description)}</textarea>
                    </div>
                    <p class="errorMessage" style="padding-left: ${labelWidth}px;"></p>
                </div>
                <div class="el-form-item ${btnShow}">
                    <div class="el-form-item-div btn-group">
                        <button type="button" class="el-button cancle">取消</button>
                        <button type="button" class="el-button el-button--primary submit ${flag}">确定</button>
                    </div>
                </div>
        </form>`,
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
$('body').on('click', '.submit', function() {
    var  data = {
        code: $('#code').val(),
        name: $('#name').val(),
        description: $('#desc').val(),
        _token: TOKEN
    }
    AjaxClient.post({
        url: URLS['procedure'].store,
        data: data,
        dataType: 'json',
        beforeSend: function () {
            layerLoading = layer.load(2, { shade: false, offset: '300px' });
        },
        success: function (rsp) {
            layer.close(layerLoading);
            layer.close(layerModal);
            layer.msg('添加能力成功！', { time: 3000, icon: 1 });
            getCount();
        },
        fail: function (rsp) {
            layer.close(layerLoading);
            if (rsp.field !== undefined) {
                showInvalidMessage(rsp.field, rsp.message);
            }
            if (rsp && rsp.message != undefined && rsp.message != null) {
                LayerConfig('fail', rsp.message)
            }
        },
        complete: function () {
            $('.addAbility .submit').removeClass('is-disabled');
        }
    }, this)
})

