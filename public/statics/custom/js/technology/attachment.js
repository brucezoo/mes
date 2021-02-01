$(function () {

    $('body').on('click','.viewAttachment',function (e) {
        e.stopPropagation();
        var id = $(this).attr('data-id');
        var type = $(this).attr('data-type');
        getAttachment(id,type)

    })
    //图片放大
    $('body').on('click', '.pic-img', function () {
        var imgList, current;
        if ($(this).hasClass('pic-list-img')) {
            imgList = $(this).parents('ul').find('.pic-li');
            current = $(this).parents('.pic-li').attr('data-id');
        } else {
            imgList = $(this);
            current = $(this).attr('data-id');
        }
        showBigImg(imgList, current);
    });

    // 上傳臨時工藝
    $('body').on('click', '.uploadFile', function (e) {
        e.stopPropagation();
        var wo_number = $(this).attr('data-wo-number');
        showWorkOrderFileModal(wo_number, 'upload');
    });

    // 下载臨時工藝
    $('body').on('click', '.downloadFile', function (e) {
        e.stopPropagation();
        var wo_number = $(this).attr('data-wo-number');
        showWorkOrderFileModal(wo_number, 'download');
    });

    // 臨時工藝文件選擇
    $('body').on('change', '#attachment', function (e) {
        e.stopPropagation();
        var wo_number = $(this).attr('data-wo-number');
        var $attachment = document.querySelector('#attachment');
        uploadWorkOrderFiles(wo_number, $attachment.files);
    })
});


function getAttachment(id,type) {
    AjaxClient.get({
        url: URLS['thinPro'].getCareLableList + _token + "&id=" + id + "&type=" +type,
        dataType: 'json',
        beforeSend: function () {
            layerLoading = LayerConfig('load');
        },
        success: function (rsp) {
            layer.close(layerLoading);
            if(rsp.results){
              showAttachmentModal(rsp.results)
            }else{
              LayerConfig('fail','当前检验单没有附件！')
            }
        },
        fail: function (rsp) {
            layer.close(layerLoading);
            LayerConfig('fail',rsp.message)
        }
    });

}
function showAttachmentModal(formData) {
    var title = '附件';
    layerModal = layer.open({
        type: 1,
        title: title,
        offset: '70px',
        area: '1000px',
        shade: 0.1,
        shadeClose: false,
        resize: false,
        move: '.layui-layer-title',
        moveOut: true,
        content: `<form class="attachmentForm formModal formAttachment" id="attachment_form">
        
        
        <div class="table table_page">
            <div id="pagenation" class="pagenation"></div>
            <table id="table_pic_table" class="sticky uniquetable commontable">
                <thead>
                    <tr>
                        <th>物料编码</th>
                        <th class="center">规格型号</th>
                        <th class="center">缩略图</th>
                        <th class="center">版本号</th>
                        <th class="center">描述</th>
                        <th class="center">创建时间</th>
                    </tr>
                </thead>
                <tbody class="table_tbody">
                    <tr>
                        <td class="nowrap" colspan="8" style="text-align: center;">暂无数据</td>
                    </tr>
                </tbody>
            </table>
        </div>
    </form>`,
        success: function (layero, index) {
            layerEle = layero;
            createAttachmentTable(formData);
            getLayerSelectPosition($(layero));
        },
        end: function () {

        }
    });
}

function createAttachmentTable(data) {
    $('#attachment_form .table_tbody').html('');
    if (data.length) {
        data.forEach(function (item, index) {
            if(item.image_path!=null){
                var mhtml='';
                var str = item.image_path.substring(item.image_path.indexOf('.')+1,item.image_path.length),_html='';
                if(str=='jpg'||str=='png'||str=='jpeg'||str=='gif'){
                    _html=`<img width="60px;" height="60px;" data-id="${item.drawing_id}" data-src="${window.storage}${item.image_path}" class="pic-img" width="80" height="40" src="${window.storage}${item.image_path}"/>`;
                }else {
                    _html=`<a href="${window.storage}${item.image_path}" target="view_window"><i style="font-size: 48px;color: #428bca;" class="el-icon el-input-icon fa-file-o"></i></a>`;
                }
                if(item.material_attributes){
                  item.material_attributes.forEach(function(mitem,index){
                    mhtml+=`<span>${mitem.name}:${mitem.value}/</span>`
                  })
                }
                var tr = `
                <tr class="tritem" data-id="${item.drawing_id}">
                    <td><div style="width: 100px;word-break: break-all;white-space: normal;word-wrap: break-word;">${tansferNull(item.material_code)}</div></td>
                    <td style="width:240px;text-overflow: ellipsis;">${mhtml}</td>
                    <td class="center">${_html}</td>
                    <td class="center">${tansferNull(item.version_code)}</td>
                    <td class="center">${tansferNull(item.remark)}</td>
                    <td class="center">${dateFormat(tansferNull(item.ctime),'Y-m-d H:i:s')}</td>
                    
                </tr>`;
                $('#attachment_form .table_tbody').append(tr);
                $('#attachment_form .table_tbody').find('tr:last-child').data('picItem', item);
            }
        });
    } else {
        var tr = `<tr>
                <td class="nowrap" colspan="8" style="text-align: center;">暂无数据</td>
            </tr>`;
        $('#attachment_form .table_tbody').append(tr);
    }
}

// 时间戳转换成指定格式日期
// 'Y年m月d日 H时i分')
function dateFormat(timestamp, formats) {
  // formats格式包括
  // 1. Y-m-d
  // 2. Y-m-d H:i:s
  // 3. Y年m月d日
  // 4. Y年m月d日 H时i分
  formats = formats || 'Y-m-d';

  var zero = function (value) {
    if (value < 10) {
      return '0' + value;
    }
    return value;
  };

  var myDate = timestamp ? new Date(timestamp * 1000) : new Date();

  var year = myDate.getFullYear();
  var month = zero(myDate.getMonth() + 1);
  var day = zero(myDate.getDate());

  var hour = zero(myDate.getHours());
  var minite = zero(myDate.getMinutes());
  var second = zero(myDate.getSeconds());

  return formats.replace(/Y|m|d|H|i|s/ig, function (matches) {
    return ({
      Y: year,
      m: month,
      d: day,
      H: hour,
      i: minite,
      s: second
    })[matches];
  });
};


// 上传临时工艺
function showWorkOrderFileModal(wo_number, flag) {
    var title = '临时工艺';
    layerModal = layer.open({
        type: 1,
        title: title,
        offset: '70px',
        area: '1000px',
        shade: 0.1,
        shadeClose: false,
        resize: false,
        move: '.layui-layer-title',
        moveOut: true,
        content: `<form class="attachmentForm formModal formAttachment" id="attachment_form">
        <div class="table table_page">
            <div id="pagenation" class="pagenation"></div>
            <table id="table_files_table" class="sticky uniquetable commontable">
                <thead>
                    <tr>
                        <th class="center">文件</th>
                        <th class="center">创建时间</th>
                    </tr>
                </thead>
                <tbody class="table_tbody">
                    <tr>
                        <td class="nowrap" colspan="8" style="text-align: center;">暂无数据</td>
                    </tr>
                </tbody>
            </table>
            
            <div tabindex="500" style="margin-top: 20px; display: ${flag !== 'upload' ? 'none': ''};" class="btn btn-primary btn-file">
                <i class="fa fa-folder-open"></i>  
                <span class="hidden-xs">上传 …</span>
                <input id="attachment" data-wo-number="${wo_number}" name="attachment" type="file" class="file" multiple data-preview-file-type="text">
            </div>
        </div>
    </form>`,
        success: function (layero, index) {
            getWorkOrderFiles(wo_number);
        },
        end: function () {

        }
    });
}

// 获取临时工艺文件
function getWorkOrderFiles(wo_number) {
    AjaxClient.get({
        url: URLS['woCraftView'].getWorkOrderFile + '?' + _token + '&wo_number='+wo_number,
        dataType: 'json',
        beforeSend: function () {
            layerLoading = LayerConfig('load');
        },
        success: function (rsp) {
            layer.close(layerLoading);
            if (rsp.results && rsp.results.length) {
                var $tableHtml = rsp.results.map(function (item) {
                    var subfix = item.url.split('.').pop();
                    var $fileEle = "";
                    if(['jpg', 'png', 'jpeg', 'gif'].includes(subfix)){
                        $fileEle=`<img width="60px;" height="60px;" data-src="${window.storage}${item.url}" class="pic-img" width="80" height="40" src="${window.storage}${item.url}"/>`;
                    }else {
                        $fileEle=`<a href="${window.storage}${item.url}" target="view_window"><i style="font-size: 48px;color: #428bca;" class="el-icon el-input-icon fa-file-o"></i></a>`;
                    }

                    return `<tr>
                        <td style="text-align: center;">${$fileEle}</td>
                        <td style="text-align: center;">${dateFormat(tansferNull(item.create_time),'Y-m-d H:i:s')}</td>
                    <tr>`;
                });

                $('#table_files_table .table_tbody').html($tableHtml);
            }
        },
        fail: function (rsp) {
            layer.close(layerLoading);
            layer.msg(rsp.message, { icon: 5, offset: '250px', time: 1500 });
        }
    });
}

// 上传临时工艺
function uploadWorkOrderFiles(wo_number, files) {
    if (!files.length) {
        return;
    }

    var ajaxSubmitData = new FormData();
    ajaxSubmitData.append('_token', TOKEN);
    ajaxSubmitData.append('wo_number', wo_number);

    for (var i = 0; i < files.length; i++) {
        ajaxSubmitData.append('files[' + i +']', files[i]);
    }

    AjaxClient.post({
        url: URLS['woCraftView'].uploadWorkOrderFile,
        data: ajaxSubmitData,
        dataType: 'json',
        contentType: false,
        processData: false,
        beforeSend: function () {
            layerLoading = LayerConfig('load');
        },
        success: function (rsp) {
            layer.close(layerLoading);
            LayerConfig('success','上传成功');
            getWorkOrderFiles(wo_number);
        },
        fail: function (rsp) {
            layer.close(layerLoading);

        }
    }, this);
}
