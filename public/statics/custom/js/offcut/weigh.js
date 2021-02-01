// 获取总数
$(function () {

    var allFormData = [], allFormDatas = [],   factoryId = '';
    var sub = {
        factoryId:'',
        mtype:'',
        mname:'',
        zwgt:'',
        kwgt:''
    }
	document.getElementById('xz').checked = false;
	

	$('body').on('click', '.layui-tab-title > li', function() {
		if ($(this).text() == '称重') {
			
		} else if ($(this).text() == '称重清单'){
			$('#tbodys').html('');
			count();
		} else {
			counts();
			$('#t_bodys').html('');
		}
	})
    
        getList();
        function getList() {
            $('#tbody').html('');
            AjaxClient.get({
                url: '/Weight/selectWeight' + "?" + _token,
                dataType: 'json',
                fail: function (rsp) {
                    let data = rsp.results;
                    if(rsp.code == '804') {
                        let tr = `
                                <tr>
                                    <td style="font-size:20px;">暂无数据！</td>
                                </tr>
                            `;
                        $('#tbody').append(tr);
                    }else {
        
                            let tr = `
                                    <p style="font-size:30px;margin-bottom:20px;">边角料：<label for="">${data[0].offcutName}</label></p>
                                    <p style="font-size:30px;margin-bottom:20px;">毛重：<label for="">${data[0].zwgt}</label></p>
                                    <p style="font-size:30px;margin-bottom:20px;">框重：<label for="">${data[0].kwgt}</label></p>
                                    <p style="font-size:30px;margin-bottom:20px;">净重：<label for="">${data[0].menge}</label></p>
                                    <p style="font-size:30px;margin-bottom:20px;">称重日期：<label for="">${data[0].date}</label></p>
                                    <button type="button" id="dels" class="layui-btn layui-btn-primary layui-btn-sm ayui-btn layui-btn-danger " data-id="${data[0].weoghtId}" style="color:#fff;border:0; margin-top:20px;">删除</button>
                            `;
                            $('#tbody').append(tr);
                        
                    }
                    
                }
            }, this);
        }
       
    
    
        // 删除
        $('body').on('click', '#dels', function () {
    
            let id = $(this).attr('data-id');
            AjaxClient.get({
                url: URLS['weigh'].del + '?' + _token + '&id= ' + id,
                dataType: 'json',
                success: function (rsp) {
                    layer.msg('删除成功！', { time: 3000, icon: 1 });
                    getList();
                },
                fail: function (rsp) {
                    layer.msg('删除失败！', { time: 3000, icon: 1 });
                    getList();
                }
            }, this)
        })
    
    $(function () {
        bindEvent();
        getOffcutData();
    });
    function bindEvent() {

        $('body').on('click', '.factory_item', function (e) {
            e.stopPropagation();
            $(this).parents('.factorys').find('.factory_item').removeClass('factory_item_active');
            $(this).siblings().removeClass('offcut_item_active');
            $(this).addClass('factory_item_active');
            $('.factorys .choose').html('');
    
            sub.factoryId = $(this).attr('data-id');
            $('#offcut_type').html('');
            $('#offcun_from').html('');
        });
        $('body').on('click', '#divs .offcut_item', function (e) {
            let datas = $('#divs .offcut_item');
            e.stopPropagation();
            for(let i=0; i<datas.length; i++) {
                $(datas[i]).removeClass('offcut_item_active');
            }
            $(this).addClass('offcut_item_active');
            $('#offcun_from .choose').html('');
    
            sub.mname = $(this).attr('data-id');
            sub.mtype = $(this).attr('data-ids');
    
            if (sub.mname != '') {
                getMz();
            }
        });
        $('body').on('click', '#submit', function (e) {
            e.stopPropagation();
            var id = $('.offcut_item_active').attr('data-id');
            var value = $('#weight').val() ? $('#weight').val() : '';
    
            if (value != '') {
                addOffcutWeight({
                    MATNR: id,
                    MENGE: value,
                    factory_id: factoryId,
                    _token: TOKEN
                })
            }
    
        });
    }
    
    $(function () {
        AjaxClient.get({
            url: '/Weight/getFactory' + "?" + _token,
            dataType: 'json',
            success: function (rsp) {
				var data = rsp.results.results;
				if(rsp.results.results.length == 1) {
                	sub.factoryId = data[0].id;
				}else {
                	sub.factoryId = '';
				}
				allFormDatas = rsp.results.results;
				showOffcutFac();
            },
            fail: function (rsp) {
                layer.msg('获取工厂列表失败,请重试', { icon: 2, offset: '250px' });
            }
        }, this);
    })
    
    function addOffcutWeight(data) {
        AjaxClient.post({
            url: URLS['OffcutWeight'].store,
            data: data,
            dataType: 'json',
            beforeSend: function () {
                layerLoading = layer.load(2, { shade: false, offset: '300px' });
            },
            success: function (rsp) {
                layer.close(layerLoading);
                $('#weight').val('');
                $('#showOldWeight').html('');
                $('#showOldWeight').css('background-color', 'red')
                $('#showOldWeight').html(data.MENGE);
                LayerConfig('success', '添加成功');
            },
            fail: function (rsp) {
                layer.close(layerLoading);
                layer.msg('添加失败,请重试', { icon: 2, offset: '250px' });
            }
        }, this)
    }
    
    
    // 获取  边角料类型
    function getOffcutData() {
        $('.table_tbody').html('');
        AjaxClient.get({
            url: URLS['Offcut'].selete + '?' + _token,
            dataType: 'json',
            beforeSend: function () {
                layerLoading = LayerConfig('load');
            },
            success: function (rsp) {
                let arr = [];
                let data = rsp.results;
                layer.close(layerLoading);
    
                for(let i=0; i<data.length; i++) {
                    if(data[i].level == 0) {
                        arr.push(data[i]);
                    }
                }
                
                for(let i=0; i<arr.length; i++) {
                    let div = `
                        <div style="display: flex;flex-direction: row;">
                        <div class="font"  data-id="${arr[i].id}"  style="flex: 1;height: 100px;text-align: left;line-height: 100px;">${arr[i].offcut_name}</div>
                        <div style="flex: 9" id="${arr[i].id}"></div>
                    `;
    
                    $('#divs').append(div);
                }
    
                
                showOffcut(arr, data);
            },
            fail: function (rsp) {
                layer.close(layerLoading);
                LayerConfig('fail', '获取列表失败，请刷新重试');
            },
            complete: function () {
                $('#searchForm .submit').removeClass('is-disabled');
            }
        })
    }
    
    function showOffcutFac() {
        var fac = [];
        var facHtml = '';
        allFormDatas.forEach(function (item) {
			if(allFormDatas.length == 1) {
				 facHtml = `<div class="factory_item  factory_item_active" data-id="${item.id}" style="font-size:20px;  margin-right:4px;margin-bottom:-9px; position: relative;width:125px; height:120px;border-color:#bbb;">
                        
                               <div style=" margin-top:5px; word-break: break-all !important;width:125px !important; ">${item.name}</div> 
                       </div>`;
				$(".factorys").append(facHtml);
			}else {
					facHtml = `<div class="factory_item" data-id="${item.id}" style="font-size:20px;  margin-right:4px;margin-bottom:-9px; position: relative;width:125px; height:120px;border-color:#bbb;">
                        
                               <div style=" margin-top:5px; word-break: break-all !important;width:125px !important; ">${item.name}</div> 
                       </div>`;
					$(".factorys").append(facHtml);
			}
            
        });
       
    }
    
    
    function showOffcut(ar,data) {
    
        for(let i=0; i<ar.length; i++) {
            for(let j=0; j<data.length; j++) {
                if (ar[i].id == data[j].parent_id) {
                    let div = `
                        <div class="offcut_item" data-ids="${data[j].parent_id}" data-id="${data[j].id}" style="font-size:20px;  position: relative; width:125px; height:120px;border-color:#bbb;">
                           
                           <div style=" margin-top:5px; word-break: break-all !important;width:125px !important; ">${data[j].offcut_name}</div>
                       </div>
                    `;
                    $('#' + ar[i].id).append(div);
                }
            }
            
        }
    }
        var date = {
            page_no: '',
            page_size: '',
            flag: 0
        }
    
  
    function  count() {
    
        date = {
            page_no:1,
            page_size:20,
            flag:0
        }
        AjaxClient.get({
            url: URLS['weigh'].list +'?' + _token,
            data: date,
            dataType: 'json',
            success: function (rsp) {
            },
            fail: function (rsp) {
                page(rsp.total_records);
                
            }
        }, this)
    }
    
    function page(count) {
    
        layui.use(['laypage', 'layer'], function () {
            var laypage = layui.laypage
                , layer = layui.layer;
            laypage.render({
                elem: 'demo1'
                , count: count //数据总数
                , limit: 20
                , jump: function (obj) {
                    date.page_no = obj.curr;
                    date.page_size = 20;
                    getListData();
                }
            });
    
        })
    }
    
    
    function  getListData() {
        
        AjaxClient.get({
            url: URLS['weigh'].list + '?' + _token + '&page_no=' + date.page_no + '&page_size=' + date.page_size + '&flag=' + date.flag,
            dataType: 'json',
            beforeSend: function () {
                layerLoading = layer.load(0, { shade: [0.3, '#bbb'] });
            },
            fail: function (rsp) {
				$("#tbodys").html("");
				layer.close(layerLoading);
                let data = rsp.results;
                for(let i=0; i<data.length; i++) {
                    let tr  = `
                        <tr>
                            <td><input type="checkbox" name="" lay-skin="primary" data-id="${data[i].weightId}" ></td>
							<td id="offcutName">${data[i].offcutName}</td>
							<td>${data[i].code}</td>
                            <td id="zwgt">${data[i].zwgt}</td>
                            <td id="kwgt">${data[i].kwgt}</td>
                            <td id="menge">${data[i].menge}</td>
                            <td>${data[i].meins}</td>
                            <td>${data[i].date}</td>
                            <td>
                                 <button type="button" data-id="${data[i].weightId}" id="set"  class="layui-btn layui-btn-primary layui-btn-sm">修改</button>
                                 <button type="button" id="del" class="layui-btn layui-btn-primary layui-btn-sm ayui-btn layui-btn-danger " data-id="${data[i].weightId}" style="color:#fff;border:0;">删除</button>
                            </td>
                        </tr>
                    `;
                    $('#tbodys').append(tr);
                }
            }
        }, this)
    }

        // 是否有无框重
        $('#chioce').on('change', function (e) {
            e.stopPropagation();
            if (document.getElementById('chioce').checked == true) {
                date.flag = 1;
    
                date = {
                    page_no: 1,
                    page_size: 20,
                    flag: 1
                }
                getListData();
            } else {
                date = {
                    page_no: 1,
                    page_size: 20,
                    flag: 0
                }
                getListData();
            }
        })
    
    
        // 删除
        $('body').on('click', '#del', function() {
    
            let id = $(this).attr('data-id');
            AjaxClient.get({
                url: URLS['weigh'].del + '?' +  _token  +'&id= ' + id,
				dataType: 'json',
				beforeSend: function () {
					layerLoading = layer.load(0, { shade: [0.3, '#bbb'] });
				},
                success: function(rsp) {
					layer.close(layerLoading);
					$(this).parent().parent().remove();
                    layer.msg('删除成功！', { time: 3000, icon: 1, offset: 't',});
                },
                fail: function (rsp) {
			
                    layer.msg('删除失败！', { time: 3000, icon: 1, offset: 't',});
                }
            }, this)
        })
    
    
        $('body').on('click', '#set', function() {
            let id  = $(this).attr('data-id');
            let offcutName = $(this).parent().parent().find('#offcutName').text();
            let zwgt = $(this).parent().parent().find('#zwgt').text();
            let kwgt = $(this).parent().parent().find('#kwgt').text();
            let menge = $(this).parent().parent().find('#menge').text();
    
    
            layerModal = layer.open({
                type: 1,
                skin: 'layui-layer-rim', //加上边框
                area: ['410px', '310px'], //宽高
                content: `
    
                <div style="margin-top:20px;margin-left:20px;"><label style="font-size:18px;">边角料&nbsp;&nbsp;<label><input style="height:25px;width:300px; background:#f0f0f0; border:0;" type="text" readonly="readonly" value="${offcutName}"> </div>
                <div style="margin-top:20px;margin-left:20px;"><label style="font-size:18px;">毛重&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;<label><input style="height:25px;width:300px; background:#f0f0f0; border:0;" type="text" readonly="readonly" value="${zwgt}"> </div>
                <div style="margin-top:20px;margin-left:20px;"><label style="font-size:18px;">框重&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;<label><input style="height:25px;width:300px;" id="kw" type="text"  value="${kwgt}"> </div>
                <div style="margin-top:20px;margin-left:20px;"><label style="font-size:18px;">净重&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;<label><input style="height:25px;width:300px; background:#f0f0f0; border:0;" type="text" readonly="readonly" value="${menge}"> </div>
    
                <button type="button" class="layui-btn layui-btn-normal" id="ok" style="float:right; margin-right:20px; margin-top:20px;">提交</button>
            `,
            });
    
		})
		
		$("body").on("click", '#ok', function () {
			AjaxClient.post(
				{
					url: URLS["weigh"].set + "?" + _token + "&id=" + id + "&kwgt=" + $("#kw").val(),
					dataType: "json",
					success: function (rsp) {
						layer.close(layerModal);
						layer.msg("修改成功！", { time: 3000, icon: 1, offset: "t" });
						getListData();
					},
					fail: function (rsp) {
						layer.close(layerModal);
						layer.msg("修改失败！", { time: 3000, icon: 5, offset: "t" });
						getListData();
					},
				},
				this
			);
		});
    
    
        // 获取  
        $('#get').on('click', function() {
    
            getMz();
        
        })
        
        function getMz() {
            AjaxClient.get({
                url: URLS['weigh'].get + '?' + _token,
                dataType: 'json',
                success: function (rsp) {
                   
                },
                fail: function (rsp) {
    
                    if(rsp[0] == '0') {
                        ajax();
                    }else {
                        $('#val').val(rsp[0]);
                    }
                  
                }
            }, this)
        }
    
        function ajax() {
            
            AjaxClient.get({
                url: URLS['weigh'].get + '?' + _token,
                dataType: 'json',
                success: function (rsp) {
                    
                },
                fail: function (rsp) {
    
                    if(rsp[0] == '0') {
                        $('#val').val(rsp[0]);
                       return;
                    }else {
                        $('#val').val(rsp[0]);
                    }         
                }
            }, this)
        }
    
    
        // 提交
        $('#submit').on('click', function () {
            sub.zwgt = $('#val').val();
            sub.kwgt = $('#blur').val();
            if (sub.factoryId == '') {
                layer.msg('工厂未选择！', { time: 3000, icon: 5 });
            } else if (sub.mname == '') {
                layer.msg('边角料未选择！', { time: 3000, icon: 5 });
            } else if (sub.zwgt == '') {
                layer.msg('毛重未获取！', { time: 3000, icon: 5 });
            } else {
                AjaxClient.post({
                    url: URLS['weigh'].sub + '?' + _token + '&factoryId=' + sub.factoryId + '&mtype=' + sub.mtype + '&mname=' + sub.mname 
                        + '&zwgt=' +sub.zwgt,
                    dataType: 'json',
                    beforeSend: function () {
                        layerLoading = layer.load(0, { shade: [0.3, '#bbb'] });
                    },
                    success: function (rsp) {
                        layer.close(layerLoading);
						layerModal = layer.open({
							type: 1,
							closeBtn: 0,
							skin: 'layui-layer-rim', //加上边框
							area: ['600px', '200px'], //宽高
							content: `<div style="font-size:50px;text-align: center !important;">提交成功！</div>
									<button id="yes" type="button" class="layui-btn layui-btn-lg layui-btn-danger" style="font-size:30px;margin-top:20px;float:right; margin-right:20px;">确定</button>
							`
						});
						
					
						
                    },
                    fail: function (rsp) {
                        layer.close(layerLoading);
						layer.msg(`<span style="font-size:50px;text-align: center;">${rsp.message}</span>`, { time: 3000, icon: 5, area: ['1000px', '100px'], });
                    }
                }, this)
            }
        })
	
			$("body").on("click", '#yes', function () {
				layer.close(layerModal);
				getList();
				// count();
			});
    
        // 全选
    
        $('#xz').on('click', function () {
            choice();
        })
    
    
        function choice() {
            let xz = $('#tbodys input');
            if (document.getElementById('xz').checked == true) {
    
                for (let i = 0; i < xz.length; i++) {
                    xz[i].checked = true;
                }
            } else {
                for (let i = 0; i < xz.length; i++) {
                    xz[i].checked = false;
                }
            }
        }
    
        //  推送
        $('#push').on('click', function () {
    
            let all = [];
            let allChoice = $('#tbodys input');
    
            for (let i = 0; i < allChoice.length; i++) {
                if (allChoice[i].checked == true) {
                    all.push($(allChoice[i]).attr('data-id'));
                }
            }
    
            if (all.length == 0) {
                layer.msg('未进行勾选！', { time: 3000, icon: 5 });
            } else {

				layer.confirm('是否确认推送！', {
					btn: ['确定', '取消'],
					btn1: function (index) {
						layer.close(index);
						AjaxClient.post({
							url: URLS['weigh'].ts + '?' + _token + '&data=' + JSON.stringify(all),
							dataType: 'json',
							success: function (rsp) {
								count();
								layer.msg('推送成功！', { time: 3000, icon: 1, offset: 't', });

							},
							fail: function (rsp) {
								count();
								layer.msg('推送失败！', { time: 3000, icon: 5, offset: 't', });

							}
						}, this)
					},
					btn2: function (index) {
						layer.close(index);
					}
				});
            }
    
        })
    
    })
    
      


	//   已推送
layui.use(['form', 'layedit', 'laydate'], function () {
	var form = layui.form
		, layer = layui.layer
		, layedit = layui.layedit
		, laydate = layui.laydate;

	//日期
	laydate.render({
		elem: '#start',
		type: 'datetime'
	});
	laydate.render({
		elem: '#end',
		type: 'datetime'
	});
})

var dates = {
	page_no: 1,
	page_size: 20,
	start_date:'',
	end_date:'',
}


function counts() {

	AjaxClient.get({
		url: '/Weight/getPushWeight' + '?' + _token,
		data: dates,
		dataType: 'json',
		success: function (rsp) {
			//    console.log(rsp);
		},
		fail: function (rsp) {
			pages(rsp.total_records);

		}
	}, this)
}

function pages(count) {

	layui.use(['laypage', 'layer'], function () {
		var laypage = layui.laypage
			, layer = layui.layer;
		laypage.render({
			elem: 'demo2'
			, count: count //数据总数
			, limit: 20
			, jump: function (obj) {
				dates.page_no = obj.curr;
				dates.page_size = 20;

				getTs();
			}
		});

	})
}

function getTs() {
	$('#t_bodys').html('');
	AjaxClient.get({
		url: '/Weight/getPushWeight' + '?' + _token + '&page_no=' + dates.page_no + '&page_size=' + dates.page_size + '&flag=' + dates.flag + '&start_date=' + dates.start_date + '&end_date=' + dates.end_date,
		dataType: 'json',
		beforeSend: function () {
			layerLoading = layer.load(0, { shade: [0.3, '#bbb'] });
		},
		fail: function (rsp) {
			layer.close(layerLoading);
			let data = rsp.results;
			for (let i = 0; i < data.length; i++) {
				let tr = `
                        <tr>
							<td id="offcutName">${data[i].offcutName}</td>
							<td>${data[i].code}</td>
                            <td id="zwgt">${data[i].zwgt}</td>
                            <td id="kwgt">${data[i].kwgt}</td>
                            <td id="menge">${data[i].menge}</td>
                            <td>${data[i].meins}</td>
                            <td>${data[i].date}</td>
                        </tr>
                    `;
				$('#t_bodys').append(tr);
			}
		}
	}, this)
}


$('body').on('click','#search', function() {
	
	if($('#start').val() == '' || $('#end').val() == '') {
		layer.msg('请选择完整时间段再进行筛选！', { time: 3000, icon: 5, offset: 't', });
	} else {
		dates.start_date = $('#start').val();
		dates.end_date = $('#end').val();
		counts();
	}
})

//  导出

$('#load').on('click', function() {

	$('#loading').attr('href', '/Weight/export?_token = 8b5491b17a70e24107c89f37b1036078' + "&start_date=" + $('#start').val() + '&end_date=' + $('#end').val() );
})



