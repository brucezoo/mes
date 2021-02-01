{{--继承父模板--}}
@extends("layouts.base")

@section("inline-header")
<link type="text/css" rel="stylesheet" href="/statics/custom/css/common.css?v={{$release}}">
<link type="text/css" rel="stylesheet" href="/statics/custom/css/image/image.css?v={{$release}}">

<input type="hidden" id="otherOutstore_view" value="otherOutstoreView">
<input type="hidden" id="otherOutstore_edit" value="otherOutstoreEdit">
@endsection

{{--重写父模板中的区块 page-main --}}
@section("page-main")
<div class="div_con_wrapper">
    <div class="actions">
       <a href="otherOutstoreAdd"><button id="storage_add" class="button button_action button_add">添加</button></a>
    </div>
    <div class="searchItem" id="searchForm">
    <form class="searchSTallo searchModal formModal" id="searchSTallo_from">
        <div class="el-item">
          <div class="el-item-show">
            <div class="el-item-align">
                <div class="el-form-item">
                <div class="el-form-item-div">
                    <label class="el-form-item-label">订单编号</label>
                    <input type="text" id="indentCode" class="el-input" placeholder="请输入订单编号" value="">
                </div>
            </div>
            <div class="el-form-item">
                <div class="el-form-item-div">
                    <label class="el-form-item-label">工单号</label>
                    <input type="text" id="workorder_code" class="el-input" placeholder="请输入工单号" value="">
                </div>
            </div>         
        </div>
        <ul class="el-item-hide">
          <li>
            <div class="el-form-item" style="width:100%;">
                <div class="el-form-item-div">
                    <label class="el-form-item-label" style="width: 100px;">日期筛选</label>
                    <span class="el-input span start_time"><span id="start_time_input"></span><input type="text" id="start_time" placeholder="开始时间" value=""></span>——
                    <span class="el-input span end_time"><span id="end_time_input"></span><input type="text" id="end_time" placeholder="结束时间" value=""></span>              
                </div>
            </div>
        </li>
        <li>
            <div class="el-form-item owner">
                    <div class="el-form-item-div">
                        <label class="el-form-item-label">所属者</label>
                        <div class="el-select-dropdown-wrap">
                            <div class="el-select">
                                <i class="el-input-icon el-icon el-icon-caret-top"></i>
                                <input type="text" readonly="readonly" id="ownerval" class="el-input" value="--请选择--">
                                <input type="hidden" class="val_id" id="owner_id" value="">
                            </div>
                            <div class="el-select-dropdown" style="">
                                <ul class="el-select-dropdown-list">
                                </ul>
                            </div>
                        </div>
                    </div>
                    <p class="errorMessage" style="padding-left: 30px;"></p>
                </div>
           <div class="el-form-item">
            <div class="el-form-item-div">
                <label class="el-form-item-label">已审核</label>
                <div class="el-select-dropdown-wrap">
                    <div class="el-select">
                        <i class="el-input-icon el-icon el-icon-caret-top"></i>
                        <input type="text" readonly="readonly" id="unitval" class="el-input" value="--请选择--">
                        <input type="hidden" class="val_id" id="status" value="">
                    </div>
                    <div class="el-select-dropdown">
                        <ul class="el-select-dropdown-list">
                            <li data-id="" class=" el-select-dropdown-item kong">--请选择--</li>
                            <li data-id="1" class=" el-select-dropdown-item">是</li>
                            <li data-id="0" class=" el-select-dropdown-item">否</li>
                        </ul>
                    </div>
                </div>
            </div>
        </div>
    </li>
</ul>
</div>
<div class="el-form-item">
    <div class="el-form-item-div btn-group" style="margin-top: 10px;">
        <span class="arrow el-select"><i class="el-input-icon el-icon el-icon-caret-top"></i></span>
        <button type="button" class="el-button el-button--primary submit">搜索</button>
        <button type="button" class="el-button reset">重置</button>
    </div>
</div>
</div>
</form>
</div>

     <div class="table_page">
        <div class="wrap_table_div" style="overflow: hidden;min-height: 500px;">
            <table id="table_otherinstore_table" class="sticky uniquetable commontable">
                <thead>
                <tr>
                    <th class="left nowrap tight"></th>
                    <th class="left nowrap">单据日期</th>
                    <th class="left nowrap">编码</th>
                    <th class="left nowrap">生产订单号</th>
                    <th class="left nowrap">工单号</th>
                    <!-- <th class="left nowrap">创建人</th> -->
                    <th class="left nowrap">所属者</th>
                    <th class="left nowrap">负责人</th>
                    <th class="left nowrap">描述</th>
                    <th class="right nowrap"></th>
                </tr>
                </thead>
                <tbody class="table_tbody">
                </tbody>
            </table>
        </div>
        <div id="pagenation" class="pagenation bottom-page"></div>
    </div>
</div>
@endsection

@section("inline-bottom")
<script src="/statics/common/pagenation/pagenation.js?v={{$release}}"></script>
<script src="/statics/common/layer/layer.js?v={{$release}}"></script>
<script src="/statics/custom/js/custom-config.js?v={{$release}}"></script>
<script src="/statics/custom/js/custom-public.js?v={{$release}}"></script>
<script src="/statics/custom/js/storage/storage-otheroutstore.js?v={{$release}}"></script>
<script src="/statics/custom/js/storage/storage-url.js?v={{$release}}"></script>
<script src="/statics/common/laydate/laydate.js"></script>
<script src="/statics/custom/js/validate.js?v={{$release}}"></script>
@endsection