{{--继承父模板--}}
@extends("layouts.base")

{{--额外添加的头部内容--}}
@section("inline-header")
<link type="text/css" rel="stylesheet" href="/statics/custom/css/common.css?v={{$release}}">
<link type="text/css" rel="stylesheet" href="/statics/common/upload/css/upload.css?v={{$release}}">
@endsection

{{--重写父模板中的区块 page-main --}}
@section("page-main")
<div class="page-content">
  <div class="tap-btn-wrap">
    <div class="el-form-item btnShow" style="margin-bottom: 10px;">
      <div class="el-form-item-div btn-group">
        <button type="button" class="el-button el-button--primary print">打印</button>
        <button type="button" class="el-button back">返回</button>
      </div>
    </div>
  </div>
  <div class="el-panel-wrap">
    <form id="distribute" class="formMateriel formTemplate normal">
      <div class="flex-wrap" style="width: 1314px">
        <div class="basic-wrap" style="border:1px solid #ddd;">
          <div style="text-align: center;padding-top:50px;padding-bottom: 20px;">
            <h2 style="margin-bottom: 20px;">索赔单查看</h2>
            <div style="text-align: right;position: relative;right: 110px;margin-bottom: 10px;">
              {{--<button type="button" class="addApply" style="color: #fff;background-color: #00BE67;border-color: #00BE67;">添加</button>--}}
              <!--<button type="button" class="deleteApply" style="color: #fff;background-color: #00BE67;border-color: #00BE67;">删除</button>-->
            </div>
          </div>
          <div class="userInput">
            <!--<div class="apply">
              <div style="text-align: right;position: relative;top: 10px;right: 2%;">
              </div>
              <div class="el-form-item" style="margin-top:18px;">
                <span class="el-form-item-div abnormal-item">
                  <label class="el-form-item-label" style="margin-bottom: 0px;width: 120px;margin-left: 65px;">
                    <span class="">检验单号</span>
                  </label>
                  <div class="el-select-dropdown-wrap">
                    <input type="text" class="el-input abnormalApply-input check-code" autocomplete="off" placeholder="请输入检验单号" value="" readonly="true">
                    <input type="hidden" class="el-input checkId" value="">
                    <input type="hidden" class="el-input unitId" value="">
                    <input type="hidden" class="el-input production_order_id" value="">
                    <input type="hidden" class="el-input sub_number" value="">
                    <input type="hidden" class="el-input sub_order_id" value="">
                    <input type="hidden" class="el-input check_resource" value="">
                    <input type="hidden" class="el-input work_order_id" value="">
                  </div>
                </span>
                <span class="el-form-item-div abnormal-item">
                  <label class="el-form-item-label" style="margin-bottom: 0px;width: 120px;margin-left: 65px;">
                    <span class="">生产单号</span>
                  </label>
                  <input type="text" class="el-input abnormalApply-input po_number" placeholder="请输入生产单号" value="" readonly="true">
                  <input type="hidden" class="el-input" value="">
                </span>
                <span class="el-form-item-div abnormal-item">
                  <label class="el-form-item-label" style="margin-bottom: 0px;width: 120px;margin-left: 65px;">
                    <span class="">工单号</span>
                  </label>
                  <input type="text" class="el-input abnormalApply-input wo_number" placeholder="请输入工单号" value="" readonly="true">
                  <input type="hidden" class="el-input" value="">
                </span>
              </div>

              <div class="el-form-item">
                <span class="el-form-item-div abnormal-item">
                  <label class="el-form-item-label" style="margin-bottom: 0px;width: 120px;margin-left: 65px;">
                    <span class="">采购凭证项目编号</span>
                  </label>
                  <input type="text" class="el-input abnormalApply-input EBELP" placeholder="请输入采购凭证项目编号" value="" readonly="true">
                  <input type="hidden" class="el-input" value="">
                </span>
                <span class="el-form-item-div abnormal-item">
                  <label class="el-form-item-label" style="margin-bottom: 0px;width: 120px;margin-left: 65px;">
                    <span class="">采购凭证编号</span>
                  </label>
                  <input type="text" class="el-input abnormalApply-input EBELN" placeholder="请输入采购凭证编号" value="" readonly="true">
                  <input type="hidden" class="el-input" value="">
                </span>
                <span class="el-form-item-div abnormal-item">
                  <label class="el-form-item-label" style="margin-bottom: 0px;width: 120px;margin-left: 65px;">
                    <span class="">销售凭证项目</span>
                  </label>
                  <input type="text" class="el-input abnormalApply-input VBELP" placeholder="请输入销售凭证项目" value="" readonly="true">
                  <input type="hidden" class="el-input" value="">
                </span>
              </div>

              <div class="el-form-item">
                <span class="el-form-item-div abnormal-item">
                  <label class="el-form-item-label" style="margin-bottom: 0px;width: 120px;margin-left: 65px;">
                    <span class="">物料</span>
                  </label>
                  <input type="text" class="el-input abnormalApply-input material_name" placeholder="请输入物料" value="" readonly="true">
                  <input type="hidden" class="el-input material_id" value="">
                </span>
                <span class="el-form-item-div abnormal-item">
                  <label class="el-form-item-label" style="margin-bottom: 0px;width: 120px;margin-left: 65px;">
                    <span class="">数量</span>
                  </label>
                  <input type="text" class="el-input abnormalApply-input order_number" placeholder="请输入数量" value="" readonly="true">
                  <input type="hidden" class="el-input" value="">
                </span>
                <span class="el-form-item-div abnormal-item">
                  <label class="el-form-item-label" style="margin-bottom: 0px;width: 120px;margin-left: 65px;">
                    <span class="">销售和分销凭证号</span>
                  </label>
                  <input type="text" class="el-input abnormalApply-input VBELN" placeholder="请输入销售和分销凭证号" value="" readonly="true">
                  <input type="hidden" class="el-input" value="">
                </span>
              </div>
              <div class="el-form-item">
                <div class="el-form-item-div abnormal-item">
                  <label class="el-form-item-label" style="margin-bottom: 0px;width: 120px;margin-left: 65px;">
                    <span class="">物料编码</span>
                  </label>
                  <input type="text" class="el-input abnormalApply-input material_code" placeholder="请输入物料编码" value="" readonly="true">
                  <input type="hidden" class="el-input" value="">
                </div>
                <div class="el-form-item-div abnormal-item">
                  <label class="el-form-item-label" style="margin-bottom: 0px;width: 120px;margin-left: 65px;">
                    <span class="">加工商/供应商名称</span>
                  </label>
                  <input type="text" class="el-input abnormalApply-input NAME1" placeholder="请输入加工商/供应商名称" value="" readonly="true">
                  <input type="hidden" class="el-input" value="">
                </div>
                <div class="el-form-item-div abnormal-item">
                  <label class="el-form-item-label" style="margin-bottom: 0px;width: 120px;margin-left: 65px;">
                    <span class="">加工商/供应商编号</span>
                  </label>
                  <input type="text" class="el-input abnormalApply-input LIFNR" placeholder="请输入加工商/供应商编号" value="" readonly="true">
                  <input type="hidden" class="el-input" value="">
                </div>
              </div>
              <div class="el-form-item">
                <div class="el-form-item-div abnormal-item">
                  <label class="el-form-item-label" style="margin-bottom: 0px;width: 120px;margin-left: 65px;">
                    <span class="">工序</span>
                  </label>
                  <input type="text" class="el-input abnormalApply-input operation_name" placeholder="请输入工序名称" value="" readonly="true">
                  <input type="hidden" class="el-input" value="">
                </div>
              </div>
            </div>-->
          </div>
          <div class="save-item" style="margin-top: 20px;">
            <input type="hidden" value="" id='itemId' />
            <div class="el-form-item harmful_item" style="width:50%;">
              <label class="el-form-item-label" style="width: 100px;">不良项目</label>
              <div class="el-form-item-div" style="min-width:180px !important;">
                <div class="el-select-dropdown-wrap">
                  <div class="el-muli-select">
                    <i class="el-input-icon el-icon el-icon-caret-top"></i>
                    <div class="el-input" id="harmful_item"></div>
                  </div>
                  <div class="el-muli-select-dropdown">
                    <ul class="el-muli-select-dropdown-list">
                    </ul>
                  </div>
                </div>
              </div>
            </div>
            <div class="el-form-item handle_method" style="width:50%;">
              <label class="el-form-item-label" style="width: 100px;">处理方式</label>
              <div class="el-form-item-div" style="min-width:180px !important;">
                <div class="el-select-dropdown-wrap">
                  <div class="el-muli-select">
                    <i class="el-input-icon el-icon el-icon-caret-top"></i>
                    <div class="el-input" id="handle_method"></div>
                  </div>
                  <div class="el-muli-select-dropdown">
                    <ul class="el-muli-select-dropdown-list">
                    </ul>
                  </div>
                </div>
              </div>
            </div>
            <div class="el-form-item expired_item" style="width:50%;">
              <label class="el-form-item-label" style="width: 100px;">失效项目</label>
              <div class="el-form-item-div" style="min-width:180px !important;">
                <div class="el-select-dropdown-wrap">
                  <div class="el-muli-select">
                    <i class="el-input-icon el-icon el-icon-caret-top"></i>
                    <div class="el-input" id="expired_item"></div>
                  </div>
                  <div class="el-muli-select-dropdown">
                    <ul class="el-muli-select-dropdown-list">
                    </ul>
                  </div>
                </div>
              </div>
            </div>
            <div class="el-form-item" style="width:50%;">
              <div class="el-form-item-div">
                <label class="el-form-item-label" style="width: 100px;">处理费用</label>
                <input type="text" readonly id="dealCost" class="el-input" placeholder="请输入处理费用" value="" />
              </div>
            </div>
            <div class="el-form-item duty_department" style="width:50%;">
              <div class="el-form-item-div" style="min-width:180px !important;">
                <label class="el-form-item-label" style="width: 100px;">责任归属</label>
                <div class="el-select-dropdown-wrap">
                  <div class="el-select">
                    <i class="el-input-icon el-icon el-icon-caret-top"></i>
                    <input type="text" readonly="readonly" id="department" class="el-input" placeholder="--请选择--">
                  </div>
                  <div class="el-select-dropdown">
                    <ul class="el-select-dropdown-list">
                    </ul>
                  </div>
                </div>
              </div>
            </div>
            <div class="el-form-item department" style="width:50%;">
              <div class="el-form-item-div" style="min-width:180px !important;">
                <label class="el-form-item-label" style="width: 100px;">统计部门</label>
                <div class="el-select-dropdown-wrap">
                  <div class="el-select">
                    <i class="el-input-icon el-icon el-icon-caret-top"></i>
                    <input type="text" readonly="readonly" id="statisticsDepartment" class="el-input" placeholder="--请选择--">
                  </div>
                  <div class="el-select-dropdown">
                    <ul class="el-select-dropdown-list">
                    </ul>
                  </div>
                </div>
              </div>
            </div>
            <div class="el-form-item">
              <div class="el-form-item-div">
                <label class="el-form-item-label" style="width: 100px;">审核人</label>
                <input type="text" id="choose_person" class="el-input" placeholder="审核人" value="" readonly>
              </div>
              <p class="errorMessage" style="padding-left: 88px;"></p>
            </div>

            <div class="el-form-item">
              <div class="el-form-item-div" style="width: 1190px;">
                <label class="el-form-item-label" style="margin-bottom: 0px;width: 100px;">问题描述</label>
                <textarea type="textarea" maxlength="500" readonly id="questionDescription" rows="5" class="el-textarea" placeholder="">
              </textarea>
              </div>
              <p class="errorMessage" style="display: block;"></p>
            </div>
            <div class="el-form-item">
              <div class="el-form-item-div" style="width: 1190px;">
                <label class="el-form-item-label" style="margin-bottom: 0px;width: 100px;">回复内容</label>
                <textarea type="textarea" maxlength="500" readonly id="review_desc" rows="5" class="el-textarea" placeholder="">
              </textarea>
              </div>
              <p class="errorMessage" style="display: block;"></p>
            </div>
          </div>
        </div>
      </div>
    </form>
    <div id="printList" style="display:none;"></div>
  </div>
</div>

@endsection

{{--额外添加的底部内容--}}
@section("inline-bottom")
<script src="/statics/custom/js/qc/qc-url.js?v={{$release}}"></script>
<script src="/statics/custom/js/qc/qc_inspection/viewclaim.js?v={{$release}}"></script>
<script src="/statics/custom/js/ajax-public.js?v={{$release}}"></script>
<script src="/statics/common/print/jQuery.print.js?v={{$release}}"></script>
@endsection