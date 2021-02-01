var  allFormData=[],factoryId='';
$(function () {
    bindEvent();
    getOffcutData();
});
function bindEvent() {
    $('body').on('click','table tr td',function (e) {
        e.stopPropagation();
        var oldValue = $("#weight").val();
        if(oldValue){
            if($(this).attr('data-id')){
                if($(this).attr('data-id')==11){

                    var newValue=oldValue.substring(0,oldValue.length-1);
                    $("#weight").val(newValue);
                }else if($(this).attr('data-id')==10){
                    var n = (oldValue.split('.')).length-1;
                    if(n>0){
                        var newValue = oldValue
                    }else {
                        var newValue = oldValue+'.';

                    }
                    $("#weight").val(newValue);
                } else {

                    var newValue = oldValue+$(this).attr('data-id');
                    newValue = newValue.replace(/[^\d.]/g,"")
                    $("#weight").val(newValue);
                }
            }
        }else {
            if($(this).attr('data-id')=='0' || $(this).attr('data-id')=='10' || $(this).attr('data-id')=='11'){
                var newValue = oldValue;
                newValue = newValue.replace(/[^\d.]/g,"")
                $("#weight").val(newValue);
            }else {
                var newValue = oldValue+$(this).attr('data-id');
                newValue = newValue.replace(/[^\d.]/g,"")
                $("#weight").val(newValue);
            }
        }
    });
    $('body').on('click','.type_item',function (e) {
        e.stopPropagation();
        $(this).addClass('type_item_active');
        $(this).siblings().removeClass('type_item_active');
        $('#offcut_type .choose').html('');
        $(this).find('.choose').html('√');
        showOffcut($(this).attr('data-id'))
    });
    $('body').on('click','.factory_item',function (e) {
        e.stopPropagation();
        $(this).parents('.factorys').find('.factory_item').removeClass('factory_item_active');
        $(this).addClass('factory_item_active');
        $('.factorys .choose').html('');
        $(this).find('.choose').html('√');
    });
    $('body').on('click','.offcut_item',function (e) {
        e.stopPropagation();
        $(this).addClass('offcut_item_active');
        $(this).siblings().removeClass('offcut_item_active');
        $('#offcun_from .choose').html('');
        $(this).find('.choose').html('√');
    });
    $('body').on('click','#submit',function (e) {
        e.stopPropagation();
        var id=$('.offcut_item_active').attr('data-id');
        var value = $('#weight').val()?$('#weight').val():'';
        var factoryId = $('.factory_item_active').attr('data-id');

        if(value!=''){
            addOffcutWeight({
                MATNR: id,
                MENGE:value,
                factory_id:factoryId,
                _token: TOKEN
            })
        }

    });

    // $('body').on('click','.factory_item',function (e) {
    //     e.stopPropagation();
    //     var id = $(this).attr('data-id');
    //     var name = $(this).attr('data-name');
    //     localStorage.setItem("factory_id",id);
    //     localStorage.setItem("factory_name",name);
    // });

}
//获取工厂列表
$(function(){
    AjaxClient.get({
        url: URLS['Offcut'].employeeFactory+"?"+_token,
        dataType: 'json',
        success:function (rsp) {
            var data = rsp.results.list;
            var factoryHtml = '';
            data.forEach(function(val,i){
                factoryHtml += `
                   <div class="factory_item" data-id="${val.id}" data-name="${val.name}" style="position: relative;">
                       <div class="choose" style="display:inline-block;position:absolute;top:10px;left:10px;width:20px;height: 20px;border-radius: 50%;border: 1px solid #EBEBEB;font-weight: bold;color: #01CB22">

                        </div>
                       <span>${val.name}</span>
                   </div>

                `
            })
            $('.factorys').html(factoryHtml);
            var factoryName=localStorage.getItem("factory_name");
            var factoryId=rsp.results.factory_id;
            $(".factory_item[data-id="+factoryId+"]").click();
        },
        fail: function(rsp){
            layer.msg('获取工厂列表失败,请重试', {icon: 2,offset: '250px'});
        }
    },this);
})

$(function(){
    // AjaxClient.get({
    //     url: URLS['Offcut'].factory+"?"+_token,
    //     dataType: 'json',
    //     success:function (rsp) {
    //         var data = rsp.results;
    //         factoryId = data[0].id;
    //         // console.log(factoryId);
    //     },
    //     fail: function(rsp){
    //         layer.msg('获取工厂列表失败,请重试', {icon: 2,offset: '250px'});
    //     }
    // },this);
})

function addOffcutWeight(data) {
    AjaxClient.post({
        url: URLS['OffcutWeight'].store,
        data: data,
        dataType: 'json',
        beforeSend: function(){
            layerLoading = layer.load(2, {shade: false,offset: '300px'});
        },
        success: function(rsp){
            layer.close(layerLoading);
            $('#weight').val('');
            $('#showOldWeight').html('');
            $('#showOldWeight').css('background-color','red')
            $('#showOldWeight').html(data.MENGE);
            LayerConfig('success','添加成功');
        },
        fail: function(rsp){
            layer.close(layerLoading);
            layer.msg('添加失败,请重试', {icon: 2,offset: '250px'});
        }
    },this)
}

function getOffcutData(){
    $('.table_tbody').html('');

    AjaxClient.get({
        url: URLS['Offcut'].selete+'?'+_token,
        dataType: 'json',
        beforeSend: function(){
            layerLoading = LayerConfig('load');
        },
        success:function (rsp) {
            layer.close(layerLoading);

            if(rsp.results && rsp.results.length){
                allFormData = rsp.results;
                showOffcutType()
            }
        },
        fail: function(rsp){
            layer.close(layerLoading);
            LayerConfig('fail','获取列表失败，请刷新重试');
        },
        complete: function(){
            $('#searchForm .submit').removeClass('is-disabled');
        }
    })
}
function showOffcutType() {
    var type = [];
    allFormData.forEach(function (item) {
        if(item.level==0){
            type.push(item);
        }
    });
    var typeHtml = '';
    type.forEach(function (item) {
        typeHtml+=`<div class="type_item" data-id="${item.id}" style="position: relative;">
                       <div class="choose" style="display:inline-block;position:absolute;top:10px;left:10px;width:20px;height: 20px;border-radius: 50%;border: 1px solid #EBEBEB;font-weight: bold;color: #01CB22">
                            
                        </div>
                       <span>${item.offcut_name}</span> 
                   </div>`
    });
    $('#offcut_type').html(typeHtml)
}

function showOffcut(id) {
    var offcut = [];
    $('#offcun_from').html('');
    allFormData.forEach(function (item) {
        if(item.parent_id==id){
            offcut.push(item);
        }
    });
    var offcutHtml = '';
    offcut.forEach(function (item) {
        offcutHtml+=`<div class="offcut_item" data-id="${item.offcut_code}" style="position: relative;">
                       <div class="choose" style="display:inline-block;position:absolute;top:10px;left:10px;width:20px;height: 20px;border-radius: 50%;border: 1px solid #EBEBEB;font-weight: bold;color: #01CB22"></div>
                       <span>${item.offcut_name}</span> 
                   </div>`
    });
    $('#offcun_from').html(offcutHtml);
}
