{{--继承父模板--}}
@extends("layouts.base")

{{--额外添加的头部内容--}}
@section("inline-header")
<style>
	.tab thead th {
		background: #fff;
		border-bottom: 1px solid #f0f0f0;
		line-height: 40px !important;
	}

	.tab td {
		border-bottom: 1px solid #f0f0f0;
		line-height: 40px !important;
	}

	.tab {
		width: 100%;
		border: 0;
	}

	#content {
		display: flex;
	}

	#content #t1 {
		width: 20%;
	}

	#content #t2 {
		width: 80%;
	}
</style>
<link type="text/css" rel="stylesheet" href="/statics/common/el/layui/css/layui.css?v={{$release}}">
<link type="text/css" rel="stylesheet" href="/statics/custom/css/schedule/fine-line-layer.css?v={{$release}}">
<link type="text/css" rel="stylesheet" href="/statics/common/el/jquery-treeview/jquery.treeview.css">
@endsection

{{--重写父模板中的区块 page-main --}}
@section("page-main")

<div>
	<input type="checkbox" id="double" checked="false">
	<label for="">双语</label>
	<label style="margin-left:20px;">语言:</label>
	<select style="width:150px;" id="list">
		<option id="one"></option>
	</select>
	<button type="button" class="layui-btn layui-btn-primary layui-btn-sm" style="margin-left:10px;margin-top:-3px;" id="translates">翻译</button>
</div>

<div id="content">
	<div id="t1">
		<ul id="browser" class="filetree" style="margin-top:30px;">
		
		</ul>
	</div>

	<div id="t2">
		<!-- 未选 -->
		<div class="layui-collapse tab1" lay-accordion="" style="margin-top:20px;" id="con">

		</div>

		<!-- 未选 -->
		<div class="layui-collapse tab2" lay-accordion="" style="margin-top:20px; display:none;" id="cons">

		</div>
	</div>
</div>




@endsection
{{--额外添加的底部内容--}}
@section("inline-bottom")
<script src="/statics/common/el/layui/layui.all.js?v={{$release}}"></script>
<script src="/statics/common/laydate/laydate.js?v={{$release}}"></script>
<script src="/statics/common/layer/layer.js"></script>
<script src="/statics/common/ace/assets/js/moment.min.js"></script>

<script src="/statics/common/el/jquery-treeview/jquery.treeview.js"></script>


<script src="/statics/common/print/jQuery.print.js?v={{$release}}"></script>
<!-- 二维码 -->
<!-- <script src="/statics/custom/js/product_order/qrcode.js?v={{$release}}"></script> -->
<script src="/statics/common/el/qrcode.min.js?v={{$release}}"></script>
<script src="/statics/common/pagenation/pagenation.js?v={{$release}}"></script>
<script src="/statics/common/wordExport/FileSaver.js?v={{$release}}"></script>
<script src="/statics/common/wordExport/jquery.wordexport.js?v={{$release}}"></script>
<script src="/statics/common/picZoom/picZoom.js?v={{$release}}"></script>

<!-- <script src="/statics/custom/js/translate/imgUp.js?v={{$release}}"></script> -->
<script src="/statics/custom/js/translate/translate-url.js?v={{$release}}"></script>

<script src="/statics/custom/js/translate/show.js?v={{$release}}"></script>

@endsection