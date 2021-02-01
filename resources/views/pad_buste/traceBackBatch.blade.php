<!DOCTYPE html>
<html lang="en">
<head>
    <meta http-equiv="X-UA-Compatible" content="IE=edge,chrome=1" />
    <meta charset="utf-8" />
    <title>批次追溯</title>
    <meta name="description" content="overview &amp; stats" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0" />
    <link rel="shortcut icon" href="/statics/custom/img/favicon.ico" type="image/x-icon" />
    <link type="text/css" rel="stylesheet" href="/statics/custom/css/common.css?v={{$release}}">
    <link type="text/css" rel="stylesheet" href="/statics/common/ace/assets/font-awesome/4.5.0/css/font-awesome.min.css?v={{$release}}">
    <link rel="stylesheet" href="/statics/custom/css/buste/buste_pad.css?v={{$release}}" />
</head>
<body>
<div>
  <form class="formModal formWorkOrder" id="workOrder_from" >
    <div class="work_order_text">
      <div class="work_order_input" style="flex:6;">
        <div style="flex:5;">
          <span style="font-size:22px;">扫描框:</span>&nbsp;&nbsp;<input type="text" id="work_order_form" style="text-align: center;padding:20px;overflow: hidden;font-size:18px;" />
          <!-- <video type="button" class="el-button el-button--primary" id="preview" style="color:#fff;width:120px;height:40px;margin: 0 5px;font-size:22px;">移动设备扫码</video> -->
        </div>
      </div>
      <div class="el-form-item work_order_button" style="flex:6;">
        <button type="button" class="el-button el-button--primary check-material" style="color:#fff;width:120px;height:40px;margin: 0 5px;font-size:22px;">用料检</button>
        <button type="button" class="el-button el-button--primary generate-batch is-disabled" style="width:120px;height:40px;margin: 0 5px;font-size:22px;">生成批次</button>
        <button type="button" class="el-button el-button--primary save is-disabled" style="width:120px;height:40px;margin: 0 5px;font-size:22px;">生成序列号</button>
      </div>
    </div>
    <div style="display:flex;border: solid 1px #d1dbe5; padding: 5px;margin-bottom:10px;">
      <div  style="min-width: 1200px;width:100%;height: 200px;overflow-y: auto;">
          <h3>派工单</h3>
          <table id="show_in_material">
            <thead>
              <tr>
                <th class="center">物料号</th>
                <th class="center">进/出</th>
              </tr>
            </thead>
            <tbody class="table_tbody">

            </tbody>
          </table>
        </div>
    </div>
    <div class="work_order_wrap">
      <div class="work_order_right" style="min-width: 1200px;height: 200px;">
        <div>
          <h3>产线</h3>
          <div style="display: none;color: red;" id="showNumber"></div>
            <table id="show_out_material">
              <thead>
                <tr>
                  <th class="center">物料号</th>
                  <th class="center" id="batch">批次号</th>
                  <th class="center">计数</th>
                </tr>
              </thead>
              <tbody class="table_tbody">

              </tbody>
            </table>
          </div>
        </div>
      </div>
      <div style="display:flex;border: solid 1px #d1dbe5;height:80px;line-height:80px;padding: 5px;margin-bottom:10px;">
          <h2>批次号</h2>
          <div style="margin-left:100px;width:300px;font-size:24px;" id="productBatch"></div>
          <div style="width:100px;height:100px;margin-left:100px;" id="batch-print-html"></div>
          <div style="width:300px;height:300px;display:none;" id="batch-print"></div>
          <div style="flex:1;"></div>
          <div class="el-form-item-div btn-group">
            <button type="button" class="el-button el-button--primary print-batch" style="color:#000;width:120px;height:40px;margin: 0 5px;font-size:22px;">打印</button>
          </div>
      </div>
      <div style="display:flex;border: solid 1px #d1dbe5; height:80px;line-height:80px;padding: 5px;">
          <h2>成品序列号</h2>
          <div style="margin-left:50px;width:300px;font-size:24px;" id="productSerialNum"></div>
          <div style="width:200px;"><img id="serial-print-html"/></div>
          <div style="flex:1;"></div>
          <div class="el-form-item-div btn-group">
            <button type="button" class="el-button el-button--primary print-serial" style="color:#000;width:120px;height:40px;margin: 0 5px;font-size:22px;">打印</button>
          </div>
      </div>
      <!-- <div class="el-form-item" style="padding-right: 10px">
        
        <div class="el-form-item-div btn-group" style="justify-content:center;">
          <button type="button" class="el-button el-button--primary submit" style="width:300px;height:50px;font-size:32px;">报工</button>
          <button type="button" class="el-button el-button--primary submit_SAP is-disabled" style="width:300px;height:50px;font-size:32px;">推送</button>
        </div>
      </div> -->
  </form>
</div>

<script type="text/javascript" src="/statics/common/ace/assets/js/jquery-2.1.4.min.js"></script>
<script type="text/javascript" src="/statics/common/layer/layer.js"></script>
<script type="text/javascript" src="/statics/common/scanQRcode/instascan.min.js"></script>

<!-- 自定义的公共js -->
<script type="text/javascript" src="/statics/custom/js/functions.js?v={{$release}}"></script>{{-- 自定义的公共函数 --}}
<script type="text/javascript" src="/statics/custom/js/custom-public.js?v={{$release}}"></script>{{-- 自定义公共js文件 --}}
<script type="text/javascript" src="/statics/custom/js/ajax-client.js?v={{$release}}"></script> {{-- 包围函数封装的 AjaxClient --}}
<script type="text/javascript" src="/statics/custom/js/batch/traceBackBatch.js?v={{$release}}"></script>
<script type="text/javascript" src="/statics/custom/js/batch/batch_url.js?v={{$release}}"></script>
<script src="/statics/common/print/jQuery.print.js?v={{$release}}"></script>
<script type="text/javascript" src="/statics/common/JsBarcode/JsBarcode.all.min.js?v={{$release}}"></script>
<script type="text/javascript" src="/statics/common/autocomplete/autocomplete-revision.js?v={{$release}}"></script>
<script type="text/javascript" src="/statics/custom/js/product_order/qrcode.js?v={{$release}}"></script>

</body>
</html>
