var labelWidth = 100, btnShow = 'btnShow';

// 全选
var allDel = [];
var allD = [];
var print = [];
var pr = [];
var arr = [];
var ch = [];
var set = [];
var del = [];


layui.use(['form', 'layedit', 'laydate'], function () {
    var form = layui.form
        , layer = layui.layer
        , layedit = layui.layedit
        , laydate = layui.laydate;

    laydate.render({
        elem: '#date2'
    });
    laydate.render({
        elem: '#date3'
    });
});


// 搜索点击事件
$('body').on('click', '#i', function () {
	if ($('#i').hasClass('layui-icon-down')) {
		$('#i').removeClass('layui-icon-down').addClass('layui-icon-up');
		$('#display').addClass('act-display');
		$('#none').addClass('act-none');
	} else {
		$('#i').removeClass('layui-icon-up').addClass('layui-icon-down');
		$('#display').removeClass('act-display');
		$('#none').removeClass('act-none');
	}
})


layui.use('form', function() {
    var form = layui.form;
})

layui.use('upload', function () {
    var $ = layui.jquery
        , upload = layui.upload;

upload.render({
    elem: '#test8'
	, url: '/OfflinePackage/checkExcelDifferentDate'
    , auto: false
    , data: { '_token': '8b5491b17a70e24107c89f37b1036078' }
    , accept: 'file'
    , bindAction: '#test9'
    , done: function (rsp) {
		if (rsp.exceList.length == 0 && rsp.sameResults.length == 0) {

			let datas = {
				flag:1,
				data:JSON.stringify(rsp.data),
				_token: TOKEN
			}
			AjaxClient.post({
				url:'/OfflinePackage/planExcelImport',
				dataType: 'json',
				data: datas,
				beforeSend: function () {
					layerLoading = layer.load(0, { shade: [0.3, '#bbb'] });
				},
				fail: function (rsp) {
					layer.close(layerLoading);

					if (rsp.code == 204) {

						let string = '';
						let data = rsp.sameResults;
						for (let i = 0; i < data.length; i++) {
							string = string + '[' + data[i].SalesOrder + ',' + data[i].SalesOrderItem + ',' + data[i].PlanDueDate + '],';
						}
						layer.alert(string + '同一销售订单、行项、计划完成日期已导入，请确认再重新上传!');
					} else if (rsp.code == 200) {
						layer.msg('上传成功！', { time: 3000, icon: 1 });
						location.reload();
					} else if (rsp.code == 202) {

						let data = rsp.results;
						let string = '';
						data.forEach(item => {
							string = string + '[' + item.salesOrder + ',' + item.salesOrderItem + ',' + item.Description + '],';
						});
						layer.alert(string + '没有与SKU关联,请与业务部联系!');
					} else if (rsp.code == 206) {

						let data = rsp.exceList;
						let string = '';
						data.forEach(item => {
							string = string + '[' + item.SalesOrder + ',' + item.SalesOrderItem + ',' + item.PlanDueDate + '],';
						});
						layer.alert('ecxel表格中' + string + '重复！请检查表格！');
					}

					
				},
				success : function(rsp) {
					layer.close(layerLoading);

					if (rsp.code == 204) {

						let string = '';
						let data = rsp.sameResults;
						for (let i = 0; i < data.length; i++) {
							string = string + '[' + data[i].SalesOrder + ',' + data[i].SalesOrderItem + ',' + data[i].PlanDueDate + '],';
						}
						layer.alert(string + '同一销售订单、行项、计划完成日期已导入，请确认再重新上传!');
					} else if (rsp.code == 200) {
						layer.msg('上传成功！', { time: 3000, icon: 1 });
						location.reload();
					} else if (rsp.code == 202) {

						let data = rsp.results;
						let string = '';
						data.forEach(item => {
							string = string + '[' + item.salesOrder + ',' + item.salesOrderItem + ',' + item.Description + '],';
						});
						layer.alert(string + '没有与SKU关联,请与业务部联系!');
					} else if (rsp.code == 206) {

						let data = rsp.exceList;
						let string = '';
						data.forEach(item => {
							string = string + '[' + item.SalesOrder + ',' + item.SalesOrderItem + ',' + item.PlanDueDate + '],';
						});
						layer.alert('ecxel表格中' + string + '重复！请检查表格！');
					}

				}

			}, this);
			
		} else {
			let strings = '';
			let stringe = '';
			if (rsp.exceList.length != 0){

				let data = rsp.exceList;	
				data.forEach(item => {
					strings = strings + '[' + item.SalesOrder + ',' + item.SalesOrderItem + ',' + '],';
				});
				
				strings = '表格内：'+ strings + '有不同的完成日期，请检查excel表格！' ;
			}

			if (rsp.sameResults.length !=0 ) {
				let data = rsp.sameResults;
				
				data.forEach(item => {
					stringe = stringe + '[' + item.SalesOrder + ',' + item.SalesOrderItem + ','  + '在这个日期' +item.PlanDueDate + '已导入' + '],';
				});
			}

			layerModal = layer.open({
				type: 1,
				skin: 'layui-layer-rim', //加上边框
				area: ['550px', '400px'], //宽高
				content: `
						<div id="eclist" style="overflow: hidden;overflow-y: scroll;height:100px;">${strings}</div>
						<hr>
						<div id="salist" style="overflow: hidden;overflow-y: scroll;height:100px;">${stringe}</div>
						<hr>
						<p style="text-align:center; font-size:20px; margin-top:20px;">是否要上传！</p>
						<button type="button" style="float:right; margin-right:20px;" class="layui-btn layui-btn-primary layui-btn-sm" id="no">否</button>
						<button type="button" style="float:right; margin-right:20px;" class="layui-btn layui-btn-primary layui-btn-sm" id="yes">是</button>
					`,
			})
		}


		$('#yes').on('click', function() {

			let datas = {
				flag: 1,
				data: JSON.stringify(rsp.data),
				_token: TOKEN
			}
			AjaxClient.post({
				url: '/OfflinePackage/planExcelImport',
				dataType: 'json',
				data: datas,
				beforeSend: function () {
					layerLoading = layer.load(0, { shade: [0.3, '#bbb'] });
				},
				fail: function (rsp) {
					layer.close(layerLoading);
					layer.close(layerModal);

					if (rsp.code == 204) {

						let string = '';
						let data = rsp.sameResults;
						for (let i = 0; i < data.length; i++) {
							string = string + '[' + data[i].SalesOrder + ',' + data[i].SalesOrderItem + ',' + data[i].PlanDueDate + '],';
						}
						layer.alert(string + '同一销售订单、行项、计划完成日期已导入，请确认再重新上传!');
					} else if (rsp.code == 200) {
						layer.msg('上传成功！', { time: 3000, icon: 1 });
						location.reload();
					} else if (rsp.code == 202) {

						let data = rsp.results;
						let string = '';
						data.forEach(item => {
							string = string + '[' + item.salesOrder + ',' + item.salesOrderItem + ',' + item.Description + '],';
						});
						layer.alert(string + '没有与SKU关联,请与业务部联系!');
					} else if (rsp.code == 206) {

						let data = rsp.exceList;
						let string = '';
						data.forEach(item => {
							string = string + '[' + item.SalesOrder + ',' + item.SalesOrderItem + ',' + item.PlanDueDate + '],';
						});
						layer.alert('ecxel表格中' + string + '重复！请检查表格！');
					}


				},
				success : function(rsp) {

					layer.close(layerLoading);
					layer.close(layerModal);

					if (rsp.code == 204) {

						let string = '';
						let data = rsp.sameResults;
						for (let i = 0; i < data.length; i++) {
							string = string + '[' + data[i].SalesOrder + ',' + data[i].SalesOrderItem + ',' + data[i].PlanDueDate + '],';
						}
						layer.alert(string + '同一销售订单、行项、计划完成日期已导入，请确认再重新上传!');
					} else if (rsp.code == 200) {
						layer.msg('上传成功！', { time: 3000, icon: 1 });
						location.reload();
					} else if (rsp.code == 202) {

						let data = rsp.results;
						let string = '';
						data.forEach(item => {
							string = string + '[' + item.salesOrder + ',' + item.salesOrderItem + ',' + item.Description + '],';
						});
						layer.alert(string + '没有与SKU关联,请与业务部联系!');
					} else if (rsp.code == 206) {

						let data = rsp.exceList;
						let string = '';
						data.forEach(item => {
							string = string + '[' + item.SalesOrder + ',' + item.SalesOrderItem + ',' + item.PlanDueDate + '],';
						});
						layer.alert('ecxel表格中' + string + '重复！请检查表格！');
					}
				}
			}, this);
		})

		$('#no').on('click', function() {
			layer.close(layerModal);
			window.location.reload();

			let datas = {
				flag: 0,
				data: JSON.stringify(rsp.data),
				_token: TOKEN
			}
			AjaxClient.post({
				url: '/OfflinePackage/planExcelImport',
				dataType: 'json',
				data: datas,
				beforeSend: function () {
					layerLoading = layer.load(0, { shade: [0.3, '#bbb'] });
				},
				success: function (rsp) {
					layer.close(layerLoading);
				},
				fail: function (rsp) {

				}
			}, this);
		})


    }
    , error: function () {
        layer.msg('上传失败！', { time: 3000, icon: 5 });
    }
});

})

// 搜索
var search = {
    state: '0',
    order: '',
    row: '',
    RankPlanName: '0',
    ProductLine: '0',
    page_no:'',
    page_size:'',
    PlanDueDate:'0',
    StartDate:'0',
}
event();
// 运行
function event() {

    new Promise(function (resolve, reject) {
        resolve();
    }).then(function () {
        search = {
            state: $('#state').val(),
            order: $('#order').val(),
            row: $('#row').val(),
            RankPlanName: $('#search-bc').val(),
            ProductLine: $('#search-cx').val(),
            page_no: 1,
            page_size: 20,
            PlanDueDate: $('#date3').val(),
            StartDate: $('#date2').val(),
        }
        AjaxClient.get({
            url: URLS['job'].list + "?" + _token + '&States=' + search.state + '&SalesOrder=' + search.order + '&SalesOrderItem=' + search.row
                + '&RankPlanName=' + search.RankPlanName + '&ProductLine=' + search.ProductLine + '&page_no=' + search.page_no + '&page_size=' + search.page_size +
                '&PlanDueDate=' + search.PlanDueDate + '&StartDate=' + search.StartDate,
            dataType: 'json',
            success: function (rsp) {
                $('#total').text('总数:' + rsp.total_records + '条');
                var count = rsp.total_records;
                fy(count);
            }
        }, this);
    })
}


$('#search').bind('click', function () {

    search = {
        state: $('#state').val(),
        order: $('#order').val(),
        row: $('#row').val(),
        RankPlanName: $('#search-bc').val(),
        ProductLine: $('#search-cx').val(),
        page_no: 1,
        page_size: 20,
        PlanDueDate: $('#date3').val(),
        StartDate: $('#date2').val(),
	}
	$('#i').removeClass('layui-icon-up').addClass('layui-icon-down');
	$('#display').removeClass('act-display');
	$('#none').removeClass('act-none');

    event();

})


function  fy(count) {
      
        layui.use(['laypage', 'layer'], function () {
                    var laypage = layui.laypage
                        , layer = layui.layer;
                    laypage.render({
                        elem: 'demo1'
                        , count: count//数据总数
						, limit: 20
						, theme: '#1E9FFF'
                        , jump: function (obj) {

                            search = {
                                state: $('#state').val(),
                                order: $('#order').val(),
                                row: $('#row').val(),
                                RankPlanName: $('#search-bc').val(),
                                ProductLine: $('#search-cx').val(),
                                page_no: obj.curr,
                                page_size: 20,
                                PlanDueDate: $('#date3').val(),
                                StartDate: $('#date2').val(),
                            }
                            $('#tbody').html('');
                            getListData();
                       
                        }
                    });
                }) 
}

   
            

// 获取列表数据

function getListData() {
    $('#tbody').html('');
    AjaxClient.get({
        url: URLS['job'].list + "?" + _token + '&States=' + search.state + '&SalesOrder=' + search.order + '&SalesOrderItem=' + search.row 
            + '&RankPlanName=' + search.RankPlanName + '&ProductLine=' + search.ProductLine + '&page_no=' + search.page_no + '&page_size=' + search.page_size +
            '&PlanDueDate=' + search.PlanDueDate + '&StartDate=' + search.StartDate,
        dataType: 'json',
        beforeSend: function (rsp) {
            layerLoading = layer.load(0, { shade: [0.3, '#bbb'] });
        },
        success: function (rsp) {
            layer.close(layerLoading);
            var data = rsp.results;
            var tr;
            var states;
            var flag;
            var Rank;
            var Line;
            $('#now').text('当前页:'+ data.length + '条');
            for(var i=0; i<data.length; i++) {
                if (data[i].States == '1') {
                    states = '待排产';
                    flag = '';
                    Line = '';
                    Rank = '';
                } else if (data[i].States == '2') {
                    states = '待派工';
                    flag = '待生产';
                    Line = '';
                    Rank = data[i].RankPlanName;
                } else if (data[i].States == '3') {
                    states = '待领料';
                    flag = '';
                    Line = '';
                    Rank = data[i].RankPlanName;
                } else if (data[i].States == '4') {
                    states = '待生产';
                    Line = data[i].ProductLine;
                    Rank = data[i].RankPlanName;
                } else if (data[i].States == '5') {
                    states = '生产中';
                    Line = data[i].ProductLine;
                    Rank = data[i].RankPlanName;
                } else if (data[i].States == '6') {
                    states = '完工';
                    Line = data[i].ProductLine;
                    Rank = data[i].RankPlanName;
                }
                tr = `<tr>
                    <td><input type="checkbox"></td>
                   <!-- <td style="color:red;">${flag}</td> -->
                    <td>${data[i].SalesOrder}&nbsp;/&nbsp;${data[i].SalesOrderItem}</td>
                    <td>${data[i].StartDate}</td>
                    <td>${data[i].PlanDueDate}</td>
                    <td>${data[i].MaterialCode}</td>
                    <td>${data[i].MaterialName}</td>
                    <td>${data[i].OrderNumber}</td>
                    <td>${data[i].Unit}</td>
                    <td>${data[i].Description == null ? '' : data[i].Description}</td>
                    <td>${Rank}</td>
                    <td>${Line}</td>
                    <td>${states}</td>
                    <td>${data[i].Remark}</td>
                </tr>`
                $('#tbody').append(tr);
            }
            allChoice(data);
        },
        fail: function (rsp) {
            console.log(rsp);
        }
    }, this);

}


function allChoice(data) {

   var check =  $('tbody input');
    document.getElementById('all-choice').checked = false;

    $('#all-choice').bind('click', function () {
        // 不选
        if (document.getElementById('all-choice').checked != true) {
            for (let i = 0; i < check.length; i++) {
                check[i].checked = false;
            }
        } else {
            // 全选 
            for (let i = 0; i < check.length; i++) {
                check[i].checked = true;
            }
        }
    })

    // 批量排产
    $('#btn-pc').bind('click', function () {
         allDel = [];
        for (let i = 0; i < data.length; i++) {
            if (check[i].checked == true) {
                if (data[i].States == '1') {
                    allDel.push(data[i].ID);
                }
            }
        }
    })


    // 撤回排产
    $('#btn-ch').bind('click', function () {
        ch = [];
        for (let i = 0; i < data.length; i++) {
            if (check[i].checked == true) {
                if (data[i].States == '3') {
                    ch.push(data[i].ID);
                }
            }
        }
    })


    $('#btn-ll').bind('click', function () {
         allD = [];
        for (let i = 0; i < data.length; i++) {
            if (check[i].checked == true) {
                if (data[i].States == '3') {
                    allD.push(data[i].ID);
                }

            }
        }   
    })

    // 分线
    $('#btn-fx').bind('click', function () {
        arr = [];
        for (let i = 0; i < data.length; i++) {
            if (check[i].checked == true) {
                if (data[i].States == '2') {
                    arr.push(data[i].ID);
                }

            }
        }
             
    })


    // 分线修改
    $('#btn-set').bind('click',function () {
        set = [];
        for(let i=0; i<data.length; i++) {
            if(check[i].checked == true) {
                if(data[i].States == '4') {
                    set.push(data[i].ID);
                }
            }
        }
    })

    // 批量删除
    $('#btn-del').bind('click', function () {
        del = [];
        for (let i = 0; i < data.length; i++) {
            if (check[i].checked == true) {
                if (data[i].States == '1' || data[i].States == '3' || data[i].States == '4' ) {
                     del.push(data[i].ID);
                }
            }
        }
    })


    // 打印
    $('#btn-dy').bind('click', function () {
        print = [];
        for (let i = 0; i < data.length; i++) {
            if (check[i].checked == true) {
                if (data[i].States == '4') {
                    print.push(data[i].ID);
                }

            }
        }

        if(print.length == 0) {
            layer.alert('请先勾选再打印！');
        } else {
            layerModal = layer.open({
                type: 1,
                skin: 'layui-layer-rim', //加上边框
                area: ['1400px', '600px'], //宽高
                content: `
                    <div style="margin-top:20px;">
                        <label>&nbsp;&nbsp;&nbsp;日期&nbsp;</label>
                        <input type="text" required style="width:200px;display:inline-block;height:30px;" name="date" id="date" lay-verify="date"  autocomplete="off" class="layui-input date">
                        <label>&nbsp;&nbsp;&nbsp;班次&nbsp;</label>
                        <select required name="" lay-verify=""  style="width:200px;" id="bc">
                                    <option value="">--- 请选择 ---</option>
                                    <option value="A">白班</option>
                                    <option value="B">夜班</option>
                                    <option value="O">长白班</option>
                        </select>
                        <label>&nbsp;&nbsp;&nbsp;班组&nbsp;</label>
                        <select required name="" lay-verify=""  style="width:200px;" id="bz">
                                    <option value="">--- 请选择 ---</option>
                                    <option value="1">1</option>
                                    <option value="2">2</option>
                                    <option value="3">3</option>
                                    <option value="4">4</option>
                                    <option value="5">5</option>
                                    <option value="6">6</option>
                                    <option value="7">7</option>
                                    <option value="8">8</option>
                                    <option value="9">9</option>
                        </select>
                        <button type="button" class="layui-btn layui-btn-primary layui-btn-sm" style="margin-left:20px;" id="find">搜索</button>
                    </div>
                    <div style="width:98%;margin:auto;height:430px; overflow: hidden;overflow-y: auto;">
                        <table class="layui-table">
                            <colgroup>
                                <col width="150">
                                <col width="200">
                                <col>
                            </colgroup>
                            <thead>
                                <tr>
                                    <th><input type="checkbox" id="all"></th>
                                    <th>销售订单</th>
                                    <th>销售订单行项目</th>
                                    <th>物料编码</th>
                                    <th>物料描述</th>
                                    <th>规格</th>
                                    <th>数量</th>
                                    <th>单位</th>
                                    <th>客户编码</th>
                                    <th>班次</th>
                                    <th>班组</th>
                                    <th>日期</th>
                                    <th>备注</th>
                                </tr> 
                            </thead>
                            <tbody id="td">

                            </tbody>
                        </table>                        
                    </div>
                    <button type="button" class="layui-btn layui-btn-sm layui-btn-normal" style="float:right;margin-right:1%;" id="ok">确定</button>
                `,
                success: function () {
                    layui.use(['form', 'layedit', 'laydate'], function () {
                        var form = layui.form
                            , layer = layui.layer
                            , layedit = layui.layedit
                            , laydate = layui.laydate;
                        //日期
                        laydate.render({
                            elem: '#date'
                        });
                        laydate.render({
                            elem: '#date2'
                        });
                        laydate.render({
                            elem: '#date3'
                        });
                    });
                    
                }

            })

        var string = print[0];
        for (let i = 1; i < print.length; i++) {
            string = string + ',' + print[i];
        }
        var date = {
            data:string,
            StartDate:'',
            RankPlanName:'',
            ProductLine:'',
            _token: TOKEN
        }
            AjaxClient.get({
                url: URLS['job'].print,
                dataType: 'json',
                data: date,
                fail: function (rsp) {
                    var data = rsp.results;
                    var tr;
                    var RankPlanName;
                    for (var i = 0; i<data.length; i++) {
 
                        for(var j=0; j<data[i].length; j++) {
                            if (data[i][j].RankPlanName == 'A') {
                                RankPlanName = '白班';
                            } else if (data[i][j].RankPlanName == 'B') {
                                RankPlanName = '夜班';
                            } else if (data[i][j].RankPlanName == 'O') {
                                RankPlanName = '长白班';
                            } 

                            tr = `<tr>
                                <td><input type="checkbox"></td>
                                <td>${data[i][j].SalesOrder}</td>
                                <td>${data[i][j].SalesOrderItem}</td>
                                <td>${data[i][j].MaterialCode}</td>
                                <td>${data[i][j].MaterialName}</td>
                                <td>${data[i][j].CenterId}</td>
                                <td>${data[i][j].OrderNumber}</td>
                                <td>${data[i][j].Unit}</td>
                                <td>${data[i][j].Description}</td>
                                <td>${RankPlanName}</td>
                                <td>${data[i][j].ProductPlanID}</td>
                                <td>${data[i][j].PlanDueDate}</td>
                                <td>${data[i][j].Remark}</td>
                            </tr>`
                            $('#td').append(tr);
                        }
                    }
                    all();
                }
            }, this);
        }
        function all() {
            $('#find').bind('click',function() {
                    if ($('#bc').val() == '--- 请选择 ---') {
                    var  Rank = '';
                    }else {
                        var Rank = $('#bc').val();
                    }
                    if ($('#bz').val() == '--- 请选择 ---') {
                    var  ProductLine = '';
                    }else {
                        var ProductLine = $('#bz').val();
                    }
                    date = {
                        data: string,
                        StartDate: $('.date').val(),
                        RankPlanName: Rank,
                        ProductLine: ProductLine,
                        _token: TOKEN
                    }

                AjaxClient.get({
                    url: URLS['job'].print,
                    dataType: 'json',
                    data: date,
                    fail: function (rsp) {
                        $('#td').html('');
                        var data = rsp.results;
                        var tr;
                        var RankPlanName;
                        for (var i = 0; i < data.length; i++) {

                            for (var j = 0; j < data[i].length; j++) {
                                if (data[i][j].RankPlanName == 'A') {
                                    RankPlanName = '白班';
                                } else if (data[i][j].RankPlanName == 'B') {
                                    RankPlanName = '夜班';
                                } else if (data[i][j].RankPlanName == 'O') {
                                    RankPlanName = '长白班';
                                }

                            tr = `<tr>
                                <td><input type="checkbox"></td>
                                <td>${data[i][j].SalesOrder}</td>
                                <td>${data[i][j].SalesOrderItem}</td>
                                <td>${data[i][j].MaterialCode}</td>
                                <td>${data[i][j].MaterialName}</td>
                                <td>${data[i][j].MaterialName}</td>
                                <td>${data[i][j].OrderNumber}</td>
                                <td>${data[i][j].Unit}</td>
                                <td>${data[i][j].Description}</td>
                                <td>${RankPlanName}</td>
                                <td>${data[i][j].ProductPlanID}</td>
                                <td>${data[i][j].PlanDueDate}</td>
                                <td>${data[i][j].Remark}</td>
                            </tr>`
                                $('#td').append(tr);
                            }
                        }
                        alls($('tbody input'), data);
                    }
                }, this);


                })
                function alls(checks,datas) {
                    document.getElementById('all').checked = false;
                    $('#all').bind('click', function () {
                        // 不选
                        if (document.getElementById('all').checked != true) {
                            for (let i = 0; i < checks.length; i++) {
                                checks[i].checked = false;
                            }
                        } else {
                            // 全选 
                            for (let i = 0; i < checks.length; i++) {
                                checks[i].checked = true;
                            }
                        }

                    })

                    $('#ok').bind('click',function() {

                        for (let i = 0; i < datas.length; i++) {
                            if (checks[i].checked == true) {
                                    pr.push(datas[i]);
                            }
                        }
                        doPrint(pr);
                        $("#printList").show();
                        $("#printList").print();
                        $("#printList").hide();

                        layer.close(layerModal);
                    })
                }        
        }       
    })
    

    // 打印调用
    function doPrint(pr) {
        var prnhtml = '';
        var tr;
        prnhtml = `
            <table border="1" cellpadding="0" cellspacing="0" width="1000">
                <thead>
                    <tr>
                        <td colspan="10" height="20" style="border-bottom: 0; ">
                            <h3 style="text-align: center; font-size: 20px; font-weight: 100;" >线下打包派工单</h3>
                        </td>
                    </tr>
                    <tr>
                        <td colspan="10" height="80" style="border-bottom: 0;text-align: right;border-top:0px; ">
                            <p>派工日期：<label for="" id="pg"></label></p>
                            <p>班次：<label for="" id="banC"></label></p>
                            <p>班组：<label for="" id="banZ"></label></p>
                        </td>
                    </tr>
                    <tr>
                        <th>销售订单</th>
                        <th>销售订单行项目</th>
                        <th>物料编码</th>
                        <th>物料描述</th>
                        <th>规格</th>
                        <th>数量</th>
                        <th>单位</th>
                        <th>客户描述</th>
                        <th>备注</th>
                        <th>二维码</th>
                    </tr>
                </thead>
                <tbody style="text-align: center;" id="tbod">
                    
                </tbody>	
	    </table>
        `;
      
        $("#printList").append(prnhtml);  
        for(let i=0; i<pr.length; i++) {  
            for(let j=0; j<pr[i].length; j++) { 
                $('#banC').text(pr[i][j].RankPlanName);
                $('#pg').text(pr[i][j].PlanDueDate);
                $('#banZ').text(pr[i][j].ProductLine);
                tr=`
                    <tr>
                        <td>${pr[i][j].SalesOrder}</td>
                        <td>${pr[i][j].SalesOrderItem}</td>
                        <td>${pr[i][j].MaterialCode}</td>
                        <td>${pr[i][j].MaterialName}</td>
                        <td>${pr[i][j].MaterialName}</td>
                        <td>${pr[i][j].OrderNumber}</td>
                        <td>${pr[i][j].Unit}</td>
                        <td>${pr[i][j].Description}</td>
                        <td>${pr[i][j].Remark}</td>
                        <td id="qr">
                            <div id="qrcode"></div>
                        </td>
                    </tr>
                `;
                $('#tbod').append(tr);
            }
            
        } 
    }

}

$('#btn-ll').bind('click', function () {
    //领料


    layerModal = layer.open({
        type: 1,
        skin: 'layui-layer-rim', //加上边框
		area: ['300px', '160px'], //宽高
		closeBtn: 0,
        content: `
                    <div style="padding-top:20px;">
                        <p style="text-align:center;">确定进行领料吗？</p>
                    <button type="button" class="layui-btn layui-btn-sm layui-btn-normal" style="margin-top:20px; float:right;margin-right:5%;" id="ok-ll">确定</button>
                    </div>
                `,
    });

    $("#ok-ll").bind('click', function() {

        layer.close(layerModal);
        var string = allD[0];
            for (let i = 1; i < allD.length; i++) {
                string = string + ',' + allD[i];
            }
            var date = {
                data: string,
                _token: TOKEN
            }
            AjaxClient.post({
                url: URLS['job'].pick,
                dataType: 'json',
                data: date,
                success: function (rsp) {
                    fx();
                },
                fail: function (rsp) {
            
                }
            }, this);
    })
            
})

$('#btn-ch').bind('click', function () {
    layerModal = layer.open({
        type: 1,
        skin: 'layui-layer-rim', //加上边框
		area: ['280px', '180px'], //宽高
		closeBtn: 0,
        content: `
            <div style="padding-top:20px;">
                        <p style="text-align:center;">确定进行撤回排产操作吗？</p>
                    <button type="button" class="layui-btn layui-btn-sm layui-btn-normal" style="margin-top:20px; float:right;margin-right:5%;" id="ok-ch">确定</button>
            </div>        
        `
    })

    $('#ok-ch').bind('click' , function() {

        layer.close(layerModal);
        var string = ch[0];
        for (let i = 1; i < ch.length; i++) {
            string = string + ',' +  ch[i];
        }
        var date = {
            ProductPlanID: string,
            _token: TOKEN
        }
        AjaxClient.post({
            url: URLS['job'].product,
            dataType: 'json',
            data: date,
            success: function (rsp) {
                layer.msg('排产撤回成功！', { time: 3000, icon: 1 });
                $('#tbody').html('');
                getListData();

            },
            fail: function (rsp) {
                console.log(rsp,ch);
                layer.msg('排产撤回失败！原因：只有带领料状态才可以撤回排产！', { time: 3000, icon: 5 });
            }
        }, this);
    })


})


    function fx() {
    // 安排生产线
        layerModal = layer.open({
            type: 1,
            skin: 'layui-layer-rim', //加上边框
			area: ['280px', '180px'], //宽高
			closeBtn: 0,
            content: `
            <div  style="width:95%;margin:auto; margin-top:20px;">
            选择生产线：
                 <select name="modules" lay-verify="required" lay-search="" id="choice">
                        <option value="1">1</option>
                        <option value="2">2</option>
                        <option value="3">3</option>
                        <option value="4">4</option>
                        <option value="5">5</option>
                        <option value="6">6</option>
                        <option value="7">7</option>
                        <option value="8">8</option>
                        <option value="9">9</option>
                </select>
            </div>
            <button type="button" class="layui-btn layui-btn-sm layui-btn-normal" id="btn-save" style="float:right;margin-top:30px; margin-right:10px;">确定</button>
        `
        })

                $('#btn-save').on('click', function () {
                    layer.close(layerModal);
                    var string = allD[0];
                    for (let i = 1; i < allD.length; i++) {
                        string = string + ',' + allD[i];
                    }
                    
                    var data = {
                        data: string,
                        ProductLine:$('#choice').val(),
                        _token: TOKEN
                    }

                    AjaxClient.post({
                        url: URLS['job'].branch,
                        dataType: 'json',
                        data: data,
                        success: function (rsp) {
                            layer.msg('分线成功！', { time: 3000, icon: 1 });
                            $('#tbody').html('');
                            getListData(); 
                        },
                        fail: function (rsp) {
                            layer.msg('分线失败！', { time: 3000, icon: 5 });
                        
                        }
                    }, this);
                })
            }


// 分线
$('#btn-set').bind('click',function() {
    layerModal = layer.open({
        type: 1,
        skin: 'layui-layer-rim', //加上边框
        area: ['280px', '180px'], //宽高
        content: `
            <div  style="width:95%;margin:auto; margin-top:20px;">
            选择生产线：
                 <select name="modules" lay-verify="required" lay-search="" id="set-choice">
                        <option value="1">1</option>
                        <option value="2">2</option>
                        <option value="3">3</option>
                        <option value="4">4</option>
                        <option value="5">5</option>
                        <option value="6">6</option>
                        <option value="7">7</option>
                        <option value="8">8</option>
                        <option value="9">9</option>
                </select>
            </div>
            <button type="button" class="layui-btn layui-btn-sm layui-btn-normal" id="save" style="float:right;margin-top:30px; margin-right:10px;">确定</button>
        `
    })
    $('#save').bind('click',function() {
        layer.close(layerModal);
        var string = set[0];
        for (let i = 1; i < set.length; i++) {
            string = string + ',' + set[i];
        }

        var data = {
            data: string,
            ProductLine: $('#set-choice').val(),
            _token: TOKEN
        }

        AjaxClient.post({
            url: URLS['sku'].set,
            dataType: 'json',
            data: data,
            success: function (rsp) {
         
                layer.msg('修改分线成功！', { time: 3000, icon: 1 });
                $('#tbody').html('');
                getListData();
            },
            fail: function (rsp) {
                layer.msg('修改分线失败！', { time: 3000, icon: 5 });
            }
        }, this);
    })
})
//排产点击事件 
$('#btn-pc').bind('click', function () {

    layerModal = layer.open({
        type: 1,
        skin: 'layui-layer-rim', //加上边框
        area: ['600px', '360px'], //宽高
        content: `<form class="addThinProduction formModal" id="addThinProduction_form" data-abilityValue="" data-task-id="" style="display:flex;justify-content:flex-start;">
                <div class="work_order_condition" style="flex:1;">
                <div class="title" style="margin-top:20px;"><h5 style="font-weight:500;">排入选项</h5></div>
                <div class="search_info">

                        <div class="el-form-item select_date" style="height:58px;">
                            <div class="el-form-item-div">
                            <label class="el-form-item-label" style="width: ${labelWidth}px;">&nbsp;&nbsp;日期</label>
                            <input type="text" id="date" style="width:448px;" class="el-input" placeholder="选择日期" autocomplete="off" value="">
                            </div>
                            <p class="errorMessage" style="padding-left: ${labelWidth}px;"></p>
                        </div>
                        <div class="el-form-item bench" style="height:58px;">
                        <div class="el-form-item-div" style="margin-left:46px; color:gray;">
                            <label style="">&nbsp;&nbsp;&nbsp;&nbsp;班次&nbsp;&nbsp;&nbsp;</label>
                                <select name="" lay-verify=""  style="width:448px;" id="banCi">
                                    <option value="">--- 请选择 ---</option>
                                    <option value="A">白班</option>
                                    <option value="B">夜班</option>
                                    <option value="O">长白班</option>
                                </select>
                        </div>
                    </div>
                    </div>
                    <div class="el-form-item ${btnShow}">
                    <div class="el-form-item-div btn-group">
                        <button type="button" class="layui-btn layui-btn-primary cancle">取消</button>
                        <button type="button" data-content='' class="layui-btn layui-btn-danger submit saveRelation_bench">确定</button>
                    </div>
                    </div>
                </div>
                </form>`,
        success: function () {
            layui.use(['form', 'layedit', 'laydate'], function () {
                var form = layui.form
                    , layer = layui.layer
                    , layedit = layui.layedit
                    , laydate = layui.laydate;
                //日期
                laydate.render({
                    elem: '#date'
                });
            });
        }
    });

    $('.cancle').bind('click', function () {
        layer.close(layerModal);
    });

    $('.submit').bind('click', function () {

        if ($('#date').val() == '' || $('#banCi').val() == '') {
            layer.msg('请完善排产信息！', { time: 3000, icon: 5 });
            }else {
                layer.close(layerModal);
                var data = {
                    ProductPlanIds: allDel,
                    StartDate: $('#date').val(),
                    RankPlanName: $('#banCi').val(),
                    _token: TOKEN
                }
                AjaxClient.post({
                    url: URLS['job'].schedu,
                    dataType: 'json',
                    data: data,
                    success: function (rsp) {
                        layer.msg('排产成功！', { time: 3000, icon: 1 });
                        $('#tbody').html('');
                        getListData();
                    },
                    fail: function (rsp) {
                        layer.msg('排产失败！', { time: 3000, icon: 5 });
                    }
                }, this);
            }

    })
})


// 批量删除
$('#btn-del').on('click', function () {


    layerModal = layer.open({
        type: 1,
        skin: 'layui-layer-rim', //加上边框
        area: ['280px', '180px'], //宽高
        content: `
            <div style="padding-top:20px;">
                        <p style="text-align:center;">确定进行删除操作吗？</p>
                    <button type="button" class="layui-btn layui-btn-sm layui-btn-normal" style="margin-top:20px; float:right;margin-right:5%;" id="ok-del">确定</button>
            </div>        
        `
    })

    $('#ok-del').on('click', function() {
         var string = del[0];
        for (let i = 1; i < del.length; i++) {
            string = string + ',' + del[i];
        }

        var data = {
            data: string,
            _token: TOKEN
        }

        AjaxClient.get({
            url: URLS['job'].del,
            dataType: 'json',
            data: data,
            success: function (rsp) {
                layer.close(layerModal);
                layer.msg('删除成功！', { time: 3000, icon: 1 });
                $('#tbody').html('');
                getListData();
            },
            fail: function (rsp) {
                layer.close(layerModal);
                layer.msg('删除失败！原因：生产中和已完工不可删除！', { time: 3000, icon: 5 });
            }
        }, this);
    })

   
})