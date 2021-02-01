{{--继承父模板--}}
@extends("layouts.base")

{{--额外添加的头部内容--}}
@section("inline-header")
    <link type="text/css" rel="stylesheet" href="/statics/custom/css/common.css?v={{$release}}">
    <link type="text/css" rel="stylesheet" href="/statics/common/fileinput/fileinput.min.css?v={{$release}}" >
    <link type="text/css" rel="stylesheet" href="/statics/common/fileinput/theme/theme.css?v={{$release}}" >
    <link type="text/css" rel="stylesheet" href="/statics/common/laydate/theme/default/laydate.css?v={{$release}}">
    <link type="text/css" rel="stylesheet" href="/statics/custom/css/qc/botton.css?v={{$release}}">
    <link type="text/css" rel="stylesheet" href="/statics/custom/css/material/material-add.css?v={{$release}}">
    <link type="text/css" rel="stylesheet" href="/statics/common/select2/select2.min.css?v={{$release}}">

@endsection

{{--重写父模板中的区块 page-main --}}
@section("page-main")

    <div class="div-all-wrap">
        <div class="bom_wrap">
            <div class="tap-btn-wrap">
                <div class="el-tap-wrap" style="display: block">
                    <span data-item="addBBasic_from" class="el-tap active">常规</span>
                    <span data-item="addMaterial_from" class="el-tap submit_plan" style="visibility: hidden;">物料</span>
                    <span data-item="addFujian_from" class="el-tap submit_plan" style="visibility: hidden;">附件</span>
                    <span data-item="addPlan_form" id="show_addPlan_form" class="el-tap submit_plan" style="visibility: hidden;" >紧急处置计划</span>
                </div>

            </div>


            <div class="el-panel-wrap" style="margin-top: 20px;">
                <!--常规 start-->
                <div class="el-panel addBBasic_from active">
                    <div class="el-form-item btnShow saveBtn" style="position: absolute;right: 90px;top: 10px;">
                        <div class="el-form-item-div btn-group">
                            <button type="button" class="el-button el-button--primary submit basic_save">保存</button>
                        </div>
                    </div>
                    <div id="addBBasic_from" class="formTemplate formBom normal">
                        <div style="width: 800px; padding: 20px;margin-top: 20px;">
                            <div class="el-form-item" style="margin:20px 0 0 20px;">
                                <div class="el-form-item-div">
                                    <label class="el-form-item-label" style="width: 100px;">客户名</label>
                                    <input type="text" id="customer_name"  data-name="客户名" class="el-input" placeholder="客户名" >
                                </div>
                            </div>
                            <div class="el-form-item" style="margin:20px 0 0 20px;">
                                <div class="el-form-item-div">
                                    <label class="el-form-item-label" style="width: 100px;">客诉单号<span class="mustItem">*</span></label>
                                    <input type="text" id="complaint_code"  data-name="客诉单号" class="el-input" placeholder="客诉单号" >
                                </div>
                                <p class="errorMessage" style="display: inline-block;"></p>
                            </div>
                            <div class="el-form-item" style="margin:20px 0 0 20px;">
                                <div class="el-form-item-div">
                                    <label class="el-form-item-label" style="width: 100px;">单号类型</label>
                                    <li class="tg-list-item" style="width: 200px;">
                                        <input class="tgl tgl-flip" id="number_type" type="checkbox">
                                        <label class="tgl-btn" data-tg-off="生产单号" style="display: inline-block;width: 100px;" data-tg-on="物料名称" for="number_type"></label>
                                    </li>
                                </div>
                            </div>
                            <div class="el-form-item" id="material_toggle" style="margin:20px 0 0 20px;">
                                <div class="el-form-item-div">
                                    <label class="el-form-item-label">生产单号</label>
                                    <select id="po_number" placeholder="生产单号" multiple style="width: 100%;"></select>
                                </div>

                            </div>
                            <div class="el-form-item" id="po_toggle" style="margin:20px 0 0 20px;">
                                <div class="el-form-item-div">
                                    <label class="el-form-item-label">物料名称</label>
                                    <select id="material_number" placeholder="物料名称" multiple style="width: 100%;"></select>
                                </div>
                            </div>
                            <div class="el-form-item" style="margin:20px 0 0 20px;">
                                <div class="el-form-item-div">
                                    <label class="el-form-item-label" style="width: 100px;">接收日期</label>
                                    <input type="text" id="NNC_received_date" readonly  data-name="接收日期" class="el-input" placeholder="接收日期" >
                                </div>
                            </div>
                            <div class="el-form-item" style="margin:20px 0 0 20px;">
                                <div class="el-form-item-div">
                                    <label class="el-form-item-label" style="width: 100px;">不良品接收日期</label>
                                    <input type="text" id="samples_received_date" readonly  data-name="不良品接收日期" class="el-input" placeholder="不良品接收日期" >
                                </div>
                            </div>
                            <div class="el-form-item" style="margin:20px 0 0 20px;">
                                <div class="el-form-item-div">
                                    <label class="el-form-item-label" style="width: 100px;">缺陷比</label>
                                    <input type="number" min="0" id="defect_rate" onblur="value=value.replace(/\-/g,'')"  data-name="缺陷比" class="el-input" placeholder="缺陷比" >
                                </div>
                            </div>
                            <div class="el-form-item" style="margin:20px 0 0 20px;">
                                <div class="el-form-item-div">
                                    <label class="el-form-item-label" style="width: 100px;">批次</label>
                                    <input type="number" min="0" id="defect_material_batch" onblur="value=value.replace(/\-/g,'')"  data-name="批次" class="el-input" placeholder="批次" >
                                </div>
                            </div>
                            <div class="el-form-item" style="margin:20px 0 0 20px;">
                                <div class="el-form-item-div">
                                    <label class="el-form-item-label" style="width: 100px;">拒收数量</label>
                                    <input type="number" min="0" id="defect_material_rejection_num"  onblur="value=value.replace(/\-/g,'')" data-name="拒收数量" class="el-input" placeholder="拒收数量" >
                                </div>
                            </div>
                            <div class="el-form-item" style="margin:20px 0 0 20px;">
                                  <div class="el-form-item-div">
                                      <label class="el-form-item-label" style="width: 100px;">工厂</label>
                                      <div class="el-select-dropdown-wrap factory_id">
                                          <div class="el-select">
                                              <i class="el-input-icon el-icon el-icon-caret-top"></i>
                                              <input type="text" readonly="readonly" class="el-input" value="--请选择--">
                                              <input type="hidden" class="val_id" id="factory_id" value="">
                                          </div>
                                          <div class="el-select-dropdown">
                                              <ul class="el-select-dropdown-list">
                                                  <li data-id="" data-code="" data-name="--请选择--" class=" el-select-dropdown-item">--请选择--</li>
                                              </ul>
                                          </div>
                                      </div>
                                  </div>
                            </div>
                            <div class="el-form-item" style="margin:20px 0 0 20px;">
                                  <div class="el-form-item-div">
                                      <label class="el-form-item-label" style="width: 100px;">客诉类型</label>
                                      <div class="el-select-dropdown-wrap">
                                          <div class="el-select">
                                              <i class="el-input-icon el-icon el-icon-caret-top"></i>
                                              <input type="text" readonly="readonly" class="el-input" value="--请选择--">
                                              <input type="hidden" class="val_id" id="customer_type" value="">
                                          </div>
                                          <div class="el-select-dropdown">
                                              <ul class="el-select-dropdown-list">
                                                  <li data-id="" data-code="" data-name="--请选择--" class=" el-select-dropdown-item">--请选择--</li>
                                                  <li data-id="1" data-code="" data-name="--国内业务--" class=" el-select-dropdown-item">--国内业务--</li>
                                                  <li data-id="2" data-code="" data-name="--国际业务--" class=" el-select-dropdown-item">--国际业务--</li>
                                                  <li data-id="3" data-code="" data-name="--自主品牌--" class=" el-select-dropdown-item">--自主品牌--</li>
                                              </ul>
                                          </div>
                                      </div>
                                  </div>
                            </div>
                            <div class="el-form-item" style="margin:20px 0 0 20px;">
                                <div class="el-form-item-div">
                                    <label class="el-form-item-label" style="width: 100px;">描述</label>
                                    <textarea type="textarea"  maxlength="500" id="defect_description" rows="5" class="el-textarea" placeholder="请输入描述,最多输入500字符"></textarea>
                                </div>
                            </div>
                        </div>
                        <div class="el-form-item btnShow btnMargin">
                            <div class="el-form-item-div btn-group">
                                <button type="button" id="submit_plan" class="el-button next" data-next="addMaterial_from">下一步</button>
                            </div>
                        </div>
                    </div>
                </div>
                <!--常规 end-->
                <!--物料 start-->
                <div class="el-panel addMaterial_from">
                    <div class="el-form-item btnShow saveBtn" style="position: absolute;right: 90px;top: 10px;">
                        <div class="el-form-item-div btn-group">
                            <button type="button" class="el-button el-button--primary submit material_save">保存</button>
                        </div>
                    </div>
                    <form id="addMaterial_from" class="formTemplate formBom normal">
                        <div class="div_con_wrapper">
                            <div class="actions">
                                <button type="button" class="button button_action button_add_material"><i class="fa fa-add"></i>添加物料</button>
                            </div>
                            <div class="table_page">
                                <div class="wrap_table_div">
                                    <table id="table_attr_table" class="sticky uniquetable commontable">
                                        <thead>
                                        <tr>
                                            <th>
                                                <div class="el-sort">
                                                    物料编号
                                                </div>
                                            </th>
                                            <th>
                                                <div class="el-sort">
                                                    物料名称
                                                </div>
                                            </th>


                                        </tr>
                                        </thead>
                                        <tbody class="table_tbody showMater">
                                            <tr>
                                                <td colspan="4" style="text-align: center;">暂无数据</td>
                                            </tr>
                                        </tbody>
                                    </table>
                                </div>
                                <div id="pagenation" class="pagenation bottom-page"></div>
                            </div>
                        </div>
                        <div class="el-form-item btnShow btnMargin">
                            <div class="el-form-item-div btn-group">
                                <button type="button" class="el-button prev" style="display: block" data-prev="addBBasic_from">上一步</button>
                                <button type="button" class="el-button next" style="display: block" data-next="addFujian_from">下一步</button>
                            </div>
                        </div>
                    </form>
                </div>
                <!--物料 end-->
                <!--附件 start-->
                <div class="el-panel addFujian_from">
                    <div class="el-form-item btnShow saveBtn" style="position: absolute;right: 90px;top: 10px;">
                        <div class="el-form-item-div btn-group">
                            <button type="button" class="el-button el-button--primary submit Fujian_save">保存</button>
                        </div>
                    </div>
                    <form id="addFujian_from" class="formTemplate formBom normal">
                        <div class="div_con_wrapper">
                            <div class="file-loading">
                                <input id="attachment" name="attachment" type="file" class="file" data-preview-file-type="text">
                            </div>
                        </div>
                        <div class="el-form-item btnShow btnMargin">
                            <div class="el-form-item-div btn-group">
                                <button type="button" class="el-button prev" style="display: block" data-prev="addMaterial_from">上一步</button>
                                <button type="button" class="el-button next" style="display: block" data-next="addPlan_form">下一步</button>
                            </div>
                        </div>
                    </form>
                </div>
                <!--附件 end-->
                <!--紧急处置计划 start-->
                <div class="el-panel addPlan_form">
                    <div class="el-form-item btnShow saveBtn" style="position: absolute;right: 90px;top: 10px;">
                        <div class="el-form-item-div btn-group">
                            <button type="button" class="el-button el-button--primary submit plan_save">保存</button>
                        </div>
                    </div>
                    <form id="addPlan_form" class="formTemplate formPlan normal">
                        <div style="width: 800px; padding: 20px;margin-top: 20px;">
                            <div class="el-form-item" style="margin:20px 0 0 20px;">
                                <div class="el-form-item-div">
                                    <label class="el-form-item-label" style="width: 150px;">是否有库存品</label>
                                    <ul class="tg-list">
                                        <li class="tg-list-item">
                                            <input class="tgl tgl-light"  id="stock" type="checkbox"/>
                                            <label class="tgl-btn" for="stock"></label>
                                        </li>
                                    </ul>
                                </div>
                            </div>
                            <div class="el-form-item stock" style="margin:20px 0 0 20px;display: none;">
                                <div class="el-form-item-div">
                                    <label class="el-form-item-label" style="width: 150px;">库存数量</label>
                                    <input type="number" min="0" id="stock_num" onblur="value=value.replace(/\-/g,'')" data-name="库存数量" class="el-input" placeholder="库存数量" >
                                </div>
                            </div>
                            <div class="el-form-item stock" style="margin:20px 0 0 20px;display: none;">
                                <div class="el-form-item-div">
                                    <label class="el-form-item-label" style="width: 150px;">库存质量</label>
                                    <input type="text" id="stock_quality"  data-name="库存质量" class="el-input" placeholder="库存质量" >
                                </div>
                            </div>
                            <div class="el-form-item stock" style="margin:20px 0 0 20px;display: none;">
                                <div class="el-form-item-div">
                                    <label class="el-form-item-label" style="width: 150px;">库存是否要隔离标志</label>
                                    <ul class="tg-list">
                                        <li class="tg-list-item">
                                            <input class="tgl tgl-light"  id="stock_flag" type="checkbox"/>
                                            <label class="tgl-btn" for="stock_flag"></label>
                                        </li>
                                    </ul>
                                </div>
                            </div>
                            <div class="el-form-item" style="margin:20px 0 0 20px;">
                                <div class="el-form-item-div">
                                    <label class="el-form-item-label" style="width: 150px;">是否在制品</label>
                                    <ul class="tg-list">
                                        <li class="tg-list-item">
                                            <input class="tgl tgl-light"  id="wip" type="checkbox"/>
                                            <label class="tgl-btn" for="wip"></label>
                                        </li>
                                    </ul>
                                </div>
                            </div>
                            <div class="el-form-item wip" style="margin:20px 0 0 20px;display: none;">
                                <div class="el-form-item-div">
                                    <label class="el-form-item-label" style="width: 150px;">在制品数量</label>
                                    <input type="number" min="0" id="wip_num" onblur="value=value.replace(/\-/g,'')" data-name="在制品数量" class="el-input" placeholder="在制品数量" >
                                </div>
                            </div>
                            <div class="el-form-item wip" style="margin:20px 0 0 20px;display: none;">
                                <div class="el-form-item-div">
                                    <label class="el-form-item-label" style="width: 150px;">在制品质量</label>
                                    <input type="text" id="wip_quality"  data-name="在制品质量" class="el-input" placeholder="在制品质量" >
                                </div>
                            </div>
                            <div class="el-form-item wip" style="margin:20px 0 0 20px;display: none;">
                                <div class="el-form-item-div">
                                    <label class="el-form-item-label" style="width: 150px;">在制品是否要隔离标志</label>
                                    <ul class="tg-list">
                                        <li class="tg-list-item">
                                            <input class="tgl tgl-light"  id="wip_flag" type="checkbox"/>
                                            <label class="tgl-btn" for="wip_flag"></label>
                                        </li>
                                    </ul>
                                </div>
                            </div>
                            <div class="el-form-item customer_stock" style="margin:20px 0 0 20px;">
                                <div class="el-form-item-div">
                                    <label class="el-form-item-label" style="width: 150px;">是否客户库存品</label>
                                    <ul class="tg-list">
                                        <li class="tg-list-item">
                                            <input class="tgl tgl-light"  id="customer_stock" type="checkbox"/>
                                            <label class="tgl-btn" for="customer_stock"></label>
                                        </li>
                                    </ul>
                                </div>
                            </div>
                            <div class="el-form-item customer_stock" style="margin:20px 0 0 20px;display: none;">
                                <div class="el-form-item-div">
                                    <label class="el-form-item-label" style="width: 150px;">客户库存数量</label>
                                    <input type="number" min="0" id="customer_stock_num" onblur="value=value.replace(/\-/g,'')" data-name="客户库存数量" class="el-input" placeholder="客户库存数量" >
                                </div>
                            </div>
                            <div class="el-form-item customer_stock" style="margin:20px 0 0 20px;display: none;">
                                <div class="el-form-item-div">
                                    <label class="el-form-item-label" style="width: 150px;">客户库存质量</label>
                                    <input type="text" id="customer_stock_quality"  data-name="客户库存质量" class="el-input" placeholder="客户库存质量" >
                                </div>
                            </div>
                            <div class="el-form-item" style="margin:20px 0 0 20px;">
                                <div class="el-form-item-div">
                                    <label class="el-form-item-label" style="width: 150px;">客户退货品处理</label>
                                    <div class="el-select-dropdown-wrap">
                                        <div class="el-select">
                                            <i class="el-input-icon el-icon el-icon-caret-top"></i>
                                            <input type="text" readonly="readonly" id="selectVal" class="el-input" value="--请选择--">
                                            <input type="hidden" class="val_id" data-code="" id="rejected_handle" value="">
                                        </div>
                                        <div class="el-select-dropdown">
                                            <ul class="el-select-dropdown-list">
                                                <li data-id="0" data-code="" data-name="--请选择--" class=" el-select-dropdown-item">--请选择--</li>
                                                <li data-id="1" data-code="" data-name="--退回公司返工--" class=" el-select-dropdown-item">--退回公司返工--</li>
                                                <li data-id="2" data-code="" data-name="--客户本地报废--" class=" el-select-dropdown-item">--客户本地报废--</li>
                                                <li data-id="3" data-code="" data-name="--委托客户处理--" class=" el-select-dropdown-item">--委托客户处理--</li>
                                                <li data-id="4" data-code="" data-name="--由公司报废--" class=" el-select-dropdown-item">--由公司报废--</li>
                                            </ul>
                                        </div>
                                    </div>

                                </div>
                            </div>
                            <div class="el-form-item" style="margin:20px 0 0 20px;">
                                <div class="el-form-item-div">
                                    <label class="el-form-item-label" style="width: 150px;">造成的影响</label>
                                    <div class="el-select-dropdown-wrap">
                                        <div class="el-select">
                                            <i class="el-input-icon el-icon el-icon-caret-top"></i>
                                            <input type="text" readonly="readonly" id="selectVal" class="el-input" value="--请选择--">
                                            <input type="hidden" class="val_id" data-code="" id="rejected_effect" value="">
                                        </div>
                                        <div class="el-select-dropdown">
                                            <ul class="el-select-dropdown-list">
                                                <li data-id="0" data-code="" data-name="--请选择--" class=" el-select-dropdown-item">--请选择--</li>
                                                <li data-id="1" data-code="" data-name="--客户丢失--" class=" el-select-dropdown-item">--客户丢失--</li>
                                                <li data-id="2" data-code="" data-name="--客户订单比例转移--" class=" el-select-dropdown-item">--客户订单比例转移--</li>
                                                <li data-id="3" data-code="" data-name="--客户抱怨--" class=" el-select-dropdown-item">--客户抱怨--</li>
                                                <li data-id="4" data-code="" data-name="--客户满意度下降--" class=" el-select-dropdown-item">--客户满意度下降--</li>
                                            </ul>
                                        </div>
                                    </div>

                                </div>
                            </div>
                            <div class="el-form-item" style="margin:20px 0 0 20px;">
                                <div class="el-form-item-div">
                                    <label class="el-form-item-label" style="width: 150px;">赔偿金额</label>
                                    <input type="number" min="0" id="pay_for_rejected" onblur="value=value.replace(/\-/g,'')" data-name="赔偿金额" class="el-input" placeholder="赔偿金额" >
                                </div>
                            </div>
                            <div class="el-form-item" style="margin:20px 0 0 20px;">
                                <div class="el-form-item-div">
                                    <label class="el-form-item-label" style="width: 150px;">运费成本</label>
                                    <input type="number" min="0" id="pay_for_travel" onblur="value=value.replace(/\-/g,'')" data-name="运费成本" class="el-input" placeholder="运费成本" >
                                </div>
                            </div>
                            <div class="el-form-item" style="margin:20px 0 0 20px;">
                                <div class="el-form-item-div">
                                    <label class="el-form-item-label" style="width: 150px;">其他费用</label>
                                    <input type="number" min="0" id="pay_for_other" onblur="value=value.replace(/\-/g,'')" data-name="其他费用" class="el-input" placeholder="其他费用" >
                                </div>
                            </div>


                            <div class="el-form-item" style="margin:20px 0 0 20px;">
                                <div class="el-form-item-div">
                                    <label class="el-form-item-label" style="width: 150px;">还能维持生产到哪天</label>
                                    <input type="text" id="customer_stock_time"  data-name="还能维持生产到哪天" class="el-input" placeholder="还能维持生产到哪天" >
                                </div>
                            </div>

                            <div class="el-form-item" style="margin:20px 0 0 20px;">
                                <div class="el-form-item-div">
                                    <label class="el-form-item-label" style="width: 150px;">有无运货要求</label>
                                    <ul class="tg-list">
                                        <li class="tg-list-item">
                                            <input class="tgl tgl-light"  id="exist_require" type="checkbox"/>
                                            <label class="tgl-btn" for="exist_require"></label>
                                        </li>
                                    </ul>
                                </div>
                            </div>
                            <div class="el-form-item require_toggle" style="margin:20px 0 0 20px;display: none">
                                <div class="el-form-item-div">
                                    <label class="el-form-item-label" style="width: 150px;">运货要求</label>
                                    <textarea type="textarea"  maxlength="500"  id="require" rows="5" class="el-textarea" placeholder="运货要求"></textarea>
                                </div>
                            </div>



                            <div class="el-form-item" style="margin:20px 0 0 20px;">
                                <div class="el-form-item-div">
                                    <label class="el-form-item-label" style="width: 150px;">计划送货时间</label>
                                    <input type="text" id="plan_date" readonly  data-name="计划送货时间" class="el-input" placeholder="计划送货时间" >
                                </div>
                            </div>

                            <div class="el-form-item" style="margin:20px 0 0 20px;">
                                <div class="el-form-item-div">
                                    <label class="el-form-item-label" style="width: 150px;">送货数量</label>
                                    <input type="number" min="0" id="next_shipment_schedule_num" onblur="value=value.replace(/\-/g,'')" data-name="送货数量" class="el-input" placeholder="送货数量" >
                                </div>
                            </div>
                            <div class="el-form-item" style="margin:20px 0 0 20px;">
                                <div class="el-form-item-div">
                                    <label class="el-form-item-label" style="width: 150px;">原定交期能否核时完成</label>
                                    <ul class="tg-list">
                                        <li class="tg-list-item">
                                            <input class="tgl tgl-light"  id="next_shipment_schedule_flag" type="checkbox"/>
                                            <label class="tgl-btn" for="next_shipment_schedule_flag"></label>
                                        </li>
                                    </ul>
                                </div>
                            </div>
                        </div>
                        <div class="el-form-item btnShow btnMargin">
                            <div class="el-form-item-div btn-group">
                                <button type="button" class="el-button prev" style="display: block" data-prev="addFujian_from">上一步</button>
                            </div>
                        </div>
                    </form>
                </div>
                <!--紧急处置计划 end-->
            </div>
        </div>
    </div>


@endsection

{{--额外添加的底部内容--}}
@section("inline-bottom")
    <script src="/statics/custom/js/qc/qc-url.js?v={{$release}}"></script>
    <script src="/statics/common/fileinput/fileinput.js?v={{$release}}"></script>
    <script src="/statics/common/fileinput/theme/theme.js?v={{$release}}"></script>
    <script src="/statics/common/fileinput/locales/zh.js?v={{$release}}"></script>
    <script src="/statics/custom/js/qc/complaint/qc-add-complaint-item.js?v={{$release}}"></script>
    <script src="/statics/common/autocomplete/autocomplete.js?v={{$release}}"></script>
    <script src="/statics/common/laydate/laydate.js"></script>
    <script src="/statics/common/select2/select2.min.js"></script>

@endsection
