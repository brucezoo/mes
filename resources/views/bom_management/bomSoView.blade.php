<!DOCTYPE html>
<html lang="en">

<head>
  <meta http-equiv="X-UA-Compatible" content="IE=edge,chrome=1" />
  <meta charset="utf-8" />
  <title>工艺查看</title>
  <meta name="description" content="overview &amp; stats" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=2.0" />
  <meta name="apple-mobile-web-app-capable" content="yes" />
  <meta name="format-detection" content="telephone=no" />
  <link type="text/css" rel="stylesheet" href="/statics/common/ace/assets/font-awesome/4.5.0/css/font-awesome.min.css">
  <link type="text/css" rel="stylesheet" href="/statics/custom/css/common.css?v={{$release}}">
  <link type="text/css" rel="stylesheet" href="/statics/custom/css/material/material-add.css?v={{$release}}" >
  <link type="text/css" rel="stylesheet" href="/statics/custom/css/bom/bomSoView.css?v={{$release}}">
</head>

<body>
  <div class="div_con_wrapper" style="margin:10px;">
    <div class="el-title-wrap" style="margin-top:20px;text-align:center;font-weight:bold;font-size:20px;">工艺查看</div>
    <div class="el-panel-wrap" style="margin-top:20px;">
      <div class="searchItem" style="height:68px;" id="searchForm">
        <form class="searchMAttr searchModal formModal" id="searchReleased_from">
          <div class="el-item">
            <div class="el-item-align" style="width:75%;">
              <div class="el-form-item sales_order_code" style="margin-bottom:0px;width:33.3%;">
                <div class="el-form-item-div">
                  <label class="el-form-item-label" style="width: 100px;">销售订单</label>
                  <input type="text" id="sales_order_code" class="el-input" placeholder="请输入销售订单" value="">
                </div>
                <p class="errorMessage" style="padding-left: 100px; display: none;">请输入销售订单</p>
              </div>
              <div class="el-form-item sales_order_project_code" style="margin-bottom:0px;width:33.3%;">
                <div class="el-form-item-div">
                  <label class="el-form-item-label" style="width: 100px;">销售订单行项</label>
                  <input type="text" id="sales_order_project_code" class="el-input" placeholder="请输入销售订单行项" value="">
                </div>
                <p class="errorMessage" style="padding-left: 100px;"></p>
              </div>
              <div class="el-form-item operation_name" style="margin-bottom:0px;width:33.3%;">
                <div class="el-form-item-div">
                  <label class="el-form-item-label" style="width: 100px;">当前工序</label>
                  <div class="el-select-dropdown-wrap">
                    <div class="el-select">
                      <i class="el-input-icon el-icon el-icon-caret-top"></i>
                      <input type="text" readonly="readonly" id="operation_name" class="el-input" placeholder="--请选择--">
                      <input type="hidden" class="val_id" id="operation_id" value="">
                    </div>
                    <div class="el-select-dropdown">
                      <ul class="el-select-dropdown-list" id="select-operation">
                        <li data-id="" class="el-select-dropdown-item">--请选择--</li>
                      </ul>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            <div class="el-form-item">
              <div class="el-form-item-div btn-group" style="margin-top: 10px;">
                <button type="button" class="el-button el-button--primary search">搜索</button>
                <button type="button" class="el-button" onclick="javascript: history.go(-1);">返回</button>
              </div>
            </div>
          </div>
        </form>
      </div>
      <table id="routing_table" class="sticky uniquetable commontable" style="table-layout：fixed;border:1px solid #000 !important;">
        <thead>
          <tr style="background-color:lightgray;">
            <th class="text-cneter has-border" style="width:15%;">
              物料编码
            </th>
            <th class="text-center has-border" style="width:80%;">
              物料属性
            </th>
          </tr>
        </thead>
        <tbody class="table_tbody" style="border:1px solid #000 !important;">
        </tbody>
      </table>
    </div>
  </div>
  <script type="text/javascript" src="/statics/common/ace/assets/js/jquery-2.1.4.min.js"></script>
  <script type="text/javascript" src="/statics/common/layer/layer.js"></script>
  <script type="text/javascript" src="/statics/custom/js/functions.js?v={{$release}}"></script>
  <script type="text/javascript" src="/statics/custom/js/custom-public.js?v={{$release}}"></script>
  <script type="text/javascript" src="/statics/custom/js/ajax-client.js?v={{$release}}"></script>
  <script type="text/javascript" src="/statics/common/routing/jquery.media.js"></script>
  <script type="text/javascript" src="/statics/common/routing/showRouting.js"></script>
  <script src="/statics/custom/js/ajax-public.js"></script>
  <script src="/statics/custom/js/bom/bom-url.js"></script>
  <script src="/statics/custom/js/bom/routing.js"></script>
  <script src="/statics/custom/js/bom/bomSoView.js?v={{$release}}"></script>
  <script src="/statics/custom/js/technology/attachment.js?v={{$release}}"></script>
</body>
</html>
