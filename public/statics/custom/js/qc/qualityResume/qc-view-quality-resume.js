$(function () {
  var id = getQueryString('id');
  AjaxClient.get({
    url: URLS['quality'].view + "?" + _token + "&id=" + id,
    dataType: 'json',
    beforeSend: function () {
      layerLoading = LayerConfig('load');
    },
    success: function (rsp) {
      layer.close(layerLoading);
      var qualityResumeMsg = rsp.results[0],
        // detail = qualityResumeMsg.groups,
        names_str = qualityResumeMsg.names_str,
        cn_name = qualityResumeMsg.cn_name,
        question_description = qualityResumeMsg.question_description,
        cause = qualityResumeMsg.cause,
        temp_way = qualityResumeMsg.temp_way,
        final_method = qualityResumeMsg.final_method,
        result_final_method = qualityResumeMsg.result_final_method,
        picture = qualityResumeMsg.picture;
      //填充明细

      $('#choose_admin').val(names_str);
      $('#create_name').val(cn_name);
      $('#questionDescription').val(question_description);
      $('#tempWay').val(temp_way);
      $('#cause').val(cause);
      $('#finalWay').val(final_method);
      $('#resultFinalMethod').val(result_final_method);

      // 基础数据
      $('#baseinfo-sales_order_code').val(qualityResumeMsg.sales_order_code);
      $('#baseinfo-sales_order_project_code').val(qualityResumeMsg.sales_order_project_code);
      $('#baseinfo-code').val(qualityResumeMsg.code);
      $('#baseinfo-material_code').val(qualityResumeMsg.material_code);
      $('#baseinfo-material_name').val(qualityResumeMsg.material_name);

      createPicDetail(picture);
    },
    fail: function (rsp) {

    }
  }, this);
})

//返回品质履历列表页面
$('body').on('click', '.back', function () {
  window.location.href = '/QC/qualityResumeList';
});

$('body').on('click', '.print', function (e) {
  e.stopPropagation();
  $('.back').hide();
  $("#qualityResume").print();
  $('.back').show();
})


function createPicDetail(data) {
  console.log('createPicDetail')
  if (data && data.length) {
    var preview = '';
    data.forEach(function (item) {
      var url = '/storage/' + item.image_path;
      if (item.image_path.indexOf('jpg') > -1 || item.image_path.indexOf('png') > -1 || item.image_path.indexOf('jpeg') > -1) {
        preview += `<li><img data-src="${url}" onerror="this.onerror=null;this.src=\'/statics/custom/img/logo_default.png\'" width="60" height="60" src="${url}" data-creator="${item.creator_name || ''}" data-ctime="${item.ctime}" data-url="${item.path}" comment="${item.comment}" attachment_id="${item.attachment_id}" class='file-preview-image existAttch pic-img'></li>`;
      }
    });
    $(".listBox").append(preview);
  }
}

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
