{{--继承父模板--}}
@extends("layouts.base")

{{--额外添加的头部内容--}}
@section("inline-header")
    <link type="text/css" rel="stylesheet" href="/statics/custom/css/common.css?v={{$release}}">
@endsection

{{--重写父模板中的区块 page-main --}}
@section("page-main")
    <div class="div_con_wrapper">
        <div class="searchItem" id="searchForm">
            <form class="searchMAttr searchModal formModal" id="searchMAttr_from">
                <div class="el-item">
                    <div class="el-item-show">
                        <div class="el-item-align">
                            <div class="el-form-item">
                                <div class="el-form-item-div">
                                    <label class="el-form-item-label">提示状态</label>
                                    <div class="el-select-dropdown-wrap">
                                        <div class="el-select">
                                            <i class="el-input-icon el-icon el-icon-caret-top"></i>
                                            <input type="text" readonly="readonly" class="el-input" value="--请选择--">
                                            <input type="hidden" class="val_id" id="is_end" value="">
                                        </div>
                                        <div class="el-select-dropdown">
                                            <ul class="el-select-dropdown-list">
                                                <li data-id="" data-code="" data-name="--请选择--" class=" el-select-dropdown-item">--请选择--</li>
                                                <li data-id="2" data-code="" data-name="推送成功" class=" el-select-dropdown-item">已提示</li>
                                                <li data-id="1" data-code="" data-name="推送失败" class=" el-select-dropdown-item">未提示</li>
                                            </ul>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div class="el-form-item">
                                <div class="el-form-item-div">
                                    <label class="el-form-item-label">场景</label>
                                    <div class="el-select-dropdown-wrap">
                                        <div class="el-select">
                                            <i class="el-input-icon el-icon el-icon-caret-top"></i>
                                            <input type="text" readonly="readonly" class="el-input" value="--请选择--">
                                            <input type="hidden" class="val_id" id="type" value="">
                                        </div>
                                        <div class="el-select-dropdown">
                                            <ul class="el-select-dropdown-list">
                                                <li data-id="" data-code="" data-name="--请选择--" class=" el-select-dropdown-item">--请选择--</li>
                                                <li data-id="1" data-code="" data-name="客诉提交" class=" el-select-dropdown-item">客诉提交</li>
                                                <li data-id="2" data-code="" data-name="发送相关部门" class=" el-select-dropdown-item">发送相关部门</li>
                                                <li data-id="3" data-code="" data-name="回复" class=" el-select-dropdown-item">回复</li>
                                                <li data-id="4" data-code="" data-name="打回" class=" el-select-dropdown-item">打回</li>
                                                <li data-id="5" data-code="" data-name="提交审核" class=" el-select-dropdown-item">提交审核</li>
                                                <li data-id="6" data-code="" data-name="审核结束" class=" el-select-dropdown-item">审核结束</li>
                                            </ul>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div class="el-form-item">
                        <div class="el-form-item-div btn-group" style="margin-top: 13px;">

                            <button type="button" class="el-button el-button--primary submit">搜索</button>
                            <button type="button" class="el-button reset">重置</button>
                            <button type="button" class="el-button end-send-message">批量关闭提示</button>
                        </div>
                    </div>
                </div>
            </form>
        </div>
        <div class="table_page">
            <div class="wrap_table_div">
                <table id="table_attr_table" class="sticky uniquetable commontable">
                    <thead>
                    <tr>
                        <th>
                            <span class="el-checkbox_input all-inmate-check">
                                 <span class="el-checkbox-outset"></span>
                            </span>
                        </td>
                        <th>
                            <div class="el-sort">
                                发送人
                            </div>
                        </th>
                        <th>
                            <div class="el-sort">
                                消息内容
                            </div>
                        </th>
                        <th>
                            <div class="el-sort">
                                场景
                            </div>
                        </th>
                        <th>
                            <div class="el-sort">
                                提示状态
                            </div>
                        </th>
                        <th>
                            <div class="el-sort">
                                创建时间
                            </div>
                        </th>
                        <th>
                            <div class="el-sort">
                                发送时间
                            </div>
                        </th>
                        <th class="right">操作</th>
                    </tr>
                    </thead>
                    <tbody class="table_tbody"></tbody>
                </table>
            </div>
            <div id="pagenation" class="pagenation bottom-page"></div>
        </div>
    </div>
@endsection

{{--额外添加的底部内容--}}
@section("inline-bottom")
    <script src="/statics/common/pagenation/pagenation.js?v={{$release}}>"></script>
    <script src="/statics/custom/js/qc/qc-url.js?v={{$release}}"></script>
    <script src="/statics/custom/js/qc/complaint/qc-message.js?v={{$release}}"></script>
@endsection
