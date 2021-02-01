;
(function ($, window, document, undefined) {
  var tdate = '';
  var GanttWrapDiv = '',
    hourArr = ['00:00', '01:00', '02:00', '03:00', '04:00', '05:00', '06:00', '07:00', '08:00', '09:00', '10:00',
      '11:00', '12:00', '13:00', '14:00', '15:00', '16:00', '17:00', '18:00', '19:00', '20:00', '21:00', '22:00', '23:00', '00:00', '01:00',
      '02:00', '03:00', '04:00', '05:00', '06:00', '07:00', '08:00', '09:00', '10:00', '11:00'];
  newHourArr = [
    '00:00', '00:10', '00:20', '00:30', '00:40', '00:50', '01:00', '01:10', '01:20', '01:30', '01:40', '01:50',
    '02:00', '02:10', '02:20', '02:30', '02:40', '02:50', '03:00', '03:10', '03:20', '03:30', '03:40', '03:50',
    '04:00', '04:10', '04:20', '04:30', '04:40', '04:50', '05:00', '05:10', '05:20', '05:30', '05:40', '05:50',
    '06:00', '06:10', '06:20', '06:30', '06:40', '06:50', '07:00', '07:10', '07:20', '07:30', '07:40', '07:50',
    '08:00', '08:10', '08:20', '08:30', '08:40', '08:50', '09:00', '09:10', '09:20', '09:30', '09:40', '09:50',
    '10:00', '10:10', '10:20', '10:30', '10:40', '10:50', '11:00', '11:10', '11:20', '11:30', '11:40', '11:50',
    '12:00', '12:10', '12:20', '12:30', '12:40', '12:50', '13:00', '13:10', '13:20', '13:30', '13:40', '13:50',
    '14:00', '14:10', '14:20', '14:30', '14:40', '14:50', '15:00', '15:10', '15:20', '15:30', '15:40', '15:50',
    '16:00', '16:10', '16:20', '16:30', '16:40', '16:50', '17:00', '17:10', '17:20', '17:30', '17:40', '17:50',
    '18:00', '18:10', '18:20', '18:30', '18:40', '18:50', '19:00', '19:10', '19:20', '19:30', '19:40', '19:50',
    '20:00', '20:10', '20:20', '20:30', '20:40', '20:50', '21:00', '21:10', '21:20', '21:30', '21:40', '21:50',
    '22:00', '22:10', '22:20', '22:30', '22:40', '22:50', '23:00', '23:10', '23:20', '23:30', '23:40', '23:50'];
  halfHourArr = ['00:00', '00:30', '01:00', '01:30', '02:00', '02:30', '03:00', '03:30', '04:00', '04:30', '05:00', '05:30',
    '06:00', '06:30', '07:00', '07:30', '08:00', '08:30', '09:00', '09:30', '10:00', '10:30', '11:00', '11:30', '12:00',
    '12:30', '13:00', '13:30', '14:00', '14:30', '15:00', '15:30', '16:00', '16:30', '17:00', '17:30', '18:00', '18:30',
    '19:00', '19:30', '20:00', '20:30', '21:00', '21:30', '22:00', '22:30', '23:00', '23:30', '00:00', '00:30', '01:00',
    '01:30', '02:00', '02:30', '03:00', '03:30', '04:00', '04:30', '05:00', '05:30', '06:00', '06:30', '07:00', '07:30',
    '08:00', '08:30', '09:00', '09:30', '10:00', '10:30', '11:00', '11:30'];
  // for(var i=0;i<24;i++){
  //     hourArr.push(i);
  // }
  var Gantt = function (ele, opt) {
    this.$element = ele,
      this.defaults = {
        'startDate': '',
        'ajaxUrl': null,
        'arrdata': null,
        'layer': null,
        'parameters': null, //其他参数
        'fn': null //回调方法
      },
      this.options = $.extend({}, this.defaults, opt)
  }

  Gantt.prototype = {
    initDom: function () {
      tdate = this.options.startDate;
      GanttWrapDiv = this.$element;
      GanttWrapDiv.
        empty().
        append('<div class="GanttHeadWrap" style="z-index:99;">\
                <div class="GanttTitleDiv">\
                    <table class="GanttTitleFixed GanttFixed">\
                        <thead>\
                            <tr>\
                                <th><div class="out"><b>时间</b><em>台板</em></div></th>\
                            </tr>\
                        </thead>\
                    </table>\
                </div>\
                <div class="GanttTaskDiv">\
                    <table class="GanttTaskFixed GanttFixed">\
                        <thead>\
                            <tr class="month"></tr>\
                            <tr class="days"></tr>\
                        </thead>\
                    </table>\
                </div>\
            </div>\
            <div class="GanttTaskWrap"><div class="GanttTitleDiv">\
                    <table class="GanttTitle">\
                        <thead>\
                            <tr>\
                                <th><div class="out"><b>时间</b><em>台板</em></div></th>\
                            </tr>\
                        </thead>\
                        <tbody></tbody>\
                    </table>\
                </div>\
                <div class="GanttTaskDiv">\
                    <table class="GanttTask">\
                        <thead>\
                            <tr class="month"></tr>\
                            <tr class="days"></tr>\
                        </thead>\
                        <tbody></tbody>\
                    </table>\
                </div></div>');
      //获取时间
      var startDate = this.options.startDate;
      if (hourArr) {
        //显示天
        DAYS = hourArr.length;
        oneDayWidth = $(".GanttTaskDiv").width() / DAYS;
        oneDayWidth < 60 ? oneDayWidth = 60 : null;
        if (hourArr && hourArr.length > 0) {
          for (var d = 0; d < hourArr.length; d++) {
            var date = tdate + ' ' + hourArr[d] + ':00',
              time = new Date(date).getTime();
            $(".days").append('<th style="width:' + oneDayWidth + 'px" data-time="' + time + '"  data-date="' + date + '">' + hourArr[d] + '</th>');
          }
        }
        //显示天
        $(".month").append('<th colspan=' + hourArr.length * 2 / 3 + '>' + tdate + '</th><th colspan=' + hourArr.length * 1 / 3 + '>' + formatTomarrowDate(tdate) + '</th>');
        $(".GanttTask,.GanttTaskFixed").css("width", (oneDayWidth * DAYS) + 'px');
      }
      //发异步
      getDataList(this.options);
      // console.log(this.options);
    }
  }

  //设置滚动条
  function scrollBar(ele) {
    $('.scrollDiv').remove();
    // if (!$('.scrollDiv').length) {
    //   ele.after('<div class="scrollDiv"><div><div class="scrollBar"></div></div></div>');
    // }
    //设置滚动条
    var GanttTaskDivWidth = $(".GanttTaskDiv").innerWidth();
    var GanttTaskWidth = $(".GanttTask").width();
    var rate = GanttTaskDivWidth / GanttTaskWidth;

    $(".scrollDiv").css({ "width": GanttTaskDivWidth });
    var scrollBarWidth = GanttTaskDivWidth * rate;
    $(".scrollBar").css({ "width": scrollBarWidth });
    var widthSub = GanttTaskDivWidth - scrollBarWidth;
    var moveoutFlag = true;
    if (widthSub > 0) {
      $(".scrollDiv").css("display", "block");
    } else {
      $(".scrollDiv").css("display", "none");
    }
    var isDown = false;
    $(".scrollBar").on('mousedown', function (e) {
      e.preventDefault();
      e.stopPropagation();
      moveoutFlag = false;
      isDown = true;
      var startOffsetLeft = e.clientX;
      var startLeft = parseInt($(".scrollBar").css("left"));
      if (isDown) {
        $(document).on('mousemove', function (e) {
          e.stopPropagation();
          var moveLeft = e.clientX - startOffsetLeft;
          var left = moveLeft + startLeft;
          if (left > widthSub) {
            left = widthSub;
          } else if (left < 0) {
            left = 0;
          }
          $(".scrollBar").css('left', left + 'px');
          $(".GanttTask,.GanttTaskFixed").css('left', (-left / rate) + 'px');
          moveoutFlag = false;
        });
        $(document).on('mouseup', function (e) {
          e.stopPropagation();
          isDown = false;
          $(document).unbind('mouseup');
          $(document).unbind('mousemove');
        });
      }
    });
  }

  var DAYS;//相差天数

  function getDataList(options) {
    var data = options.arrdata;

    setDataList(data, options);
  }

  function setDataList(orderList, options) {

    for (var i = 0; i < orderList.length; i++) {
        var tdHeight=25;
        var taskList = orderList[i].task_list;
        console.log("orderList---------"+orderList[i]);
      for (var j = 0; j < taskList.length ; j++) {
        if (j >= 1) {
          if (Date.parse(taskList[j].plan_start_time) <= Date.parse(taskList[j-1].plan_end_time)) {
            console.log("orderList---------------"+taskList[j].plan_start_time);
            tdHeight += 25;
          }
        }
      }
      if (taskList && taskList.length) {
        setTaskList(i, taskList, options,tdHeight);
      } else {
        var setTrtd = $(setTr(DAYS,tdHeight));
        $(".GanttTask tbody").append(setTrtd);
        setTrtd.css("border-bottom", "1px solid #eee");
      }
      var perTr = $('<tr data-work-bench-id="' + orderList[i].work_bench_id + '"><td style="height:' + tdHeight + 'px"><span>' + orderList[i].name + '</span></td></tr>');
      // if(orderList[i].device&&orderList[i].device.length){
      //     for(var j=0;j<orderList[i].device.length;j++){
      //         var perDevice=$('<p style="margin:0;" data-work-equip-id="'+orderList[i].device[j].id+'">('+orderList[i].device[j].name+')</p>');
      //         perTr.find('td').append(perDevice);
      //     }
      // }            
      $(".GanttTitle tbody").append(perTr);
    }

    var height = $(".GanttTask tbody").height() + 30;

    $('.GanttTask td .abdiv').on('mouseover', function (e) {
      var dele = $(this).find('.detail');
      if (e.clientY > $(window).height() - 20) {
        dele.css({ 'left': (e.clientX / 2 - 20) + 'px', 'top': (e.clientY - 150) + 'px' });
      } else {
        dele.css({ 'left': (e.clientX / 2 - 20) + 'px', 'top': (e.clientY - 90) + 'px' });
      }
      dele.css("display", "block");
      // console.log($(this).data('woitem'));
    }).on('mouseout', function () {
      $(this).find('.detail').css("display", "none");
    });
    setTimeout(function () {
      scrollBar(GanttWrapDiv);
    }, 0);
  }

  //画gantt图
  function setTaskList(perIdx, taskList, options,tdHeight) {
    var dateObj = [];
    $(".GanttTask tbody").append(setTr(DAYS,tdHeight));
    // console.log(taskList);
    for (var j = 0; j < taskList.length; j++) {
      var allLen = $(".GanttTask tbody").find("tr").length - 1;
      var sDate = (new Date(taskList[j].plan_start_time)).getTime();//任务开始时间
      var eDate = sDate + taskList[j].time * 60 * 1000;//任务结束时间
      var obj = {
        sDate: sDate,
        eDate: eDate,
        so_number: taskList[j].so_number,
        po_number: taskList[j].po_number,
        product_code: taskList[j].product_code,
        product_name: taskList[j].product_name,
        showsDate: taskList[j].plan_start_time,
        showeDate: taskList[j].plan_end_time,
        time: taskList[j].time,
        number: taskList[j].number,
        realtime: taskList[j].total_workhour
      };
      dateObj.push(obj);
    }
    if (dateObj.length>0) {
      var tdele = $(".GanttTask tbody").find("tr:eq(" + allLen + ") td");
      var colspan = tdele.attr('colspan'),
        awayBottom = 0,
        timeMin = colspan * 60 * 10;
      tdele.attr({ "all-time": timeMin }).css({ "position": "relative", "cursor": "pointer" });
      for (var i = 0; i < dateObj.length; i++) {
        // ditemEach(function(ditem,i){
        if (i >= 1) {
          if (Date.parse(dateObj[i].showsDate) <= Date.parse(dateObj[i-1].showeDate)) {
            awayBottom += 22;
          }
        }
        var percent = (dateObj[i].time * 100 / (timeMin * 3)).toFixed(2),
          left = (dateObj[i].sDate - Number(tdele.attr('data-min-time'))) / 1000 / 60;
        tdele.append('<div class="abdiv" data-use-time="' + dateObj[i].time + '" style="width: ' + percent + '%;left: ' + left + 'px;top: ' + awayBottom + 'px;"><span class="Tname" taskid=""><i></i></span>\
                    <div class="detail" style="z-index:100;"><p><label>销售订单号：</label><span>'+ dateObj[i].so_number + '</span></p>\
                                <p><label>生产订单号：</label><span>'+ dateObj[i].po_number + '</span></p>\
                                <p><label>产成品编码：</label><span>'+ dateObj[i].product_code + '</span></p>\
                                <p><label>产成品名称：</label><span>'+ dateObj[i].product_name + '</span></p>\
                                <p><label>工单号：</label><span>'+ dateObj[i].number + '</span></p>\
                                <p><label>开始时间：</label><span>'+ dateObj[i].showsDate + '</span></p>\
                                <p><label>结束时间：</label><span>'+ dateObj[i].showeDate + '</span></p>\
                                <p><label>所占产能：</label><span>'+ dateObj[i].time + 's</span></p>\
                                <p><label>真实产能：</label><span>'+ dateObj[i].realtime + 's</span></p></div>\
                    <div class="pro"><span class="finished" style="border-radius:5px;cursor:pointer;height:20px;text-align:left;width:100%;color:#333;background: '+ rgb() + '">' + dateObj[i].number + '</span></div></div>');
        tdele.find('.abdiv:last-child').data('woitem', dateObj[i]);
      }
    }
  }

  //随机色
  function rgb() {//十六进制颜色随机
    var r = Math.floor(Math.random() * 256);
    var g = Math.floor(Math.random() * 256);
    var b = Math.floor(Math.random() * 256);
    var color = '#' + r.toString(16) + g.toString(16) + b.toString(16);
    return color;
  }

  //根据当天日期获取明天日期
  function formatTomarrowDate(date) {
    var cur = new Date(date);
    var month = (cur.getMonth() + 1) < 10 ? '0' + (cur.getMonth() + 1) : (cur.getMonth() + 1);
    var day = cur.getDate() < 10 ? '0' + (cur.getDate() + 1) : (cur.getDate() + 1);
    var hour = cur.getHours() < 10 ? '0' + cur.getHours() : cur.getHours();
    var min = cur.getMinutes() < 10 ? '0' + cur.getMinutes() : cur.getMinutes();
    var dateStr = cur.getFullYear() + '-' + month + '-' + day;
    return dateStr;
  }

  //拼接tr字符串，包含tdNum个td
  function setTr(tdNum,tdHeight) {
    tdNum *= 2;
    // console.log(tdNum);
    var newDate = tdate + ' ' + '00:00:00',
      snewDate = new Date(newDate).getTime();
      console.log("tdHeight--------"+tdHeight);
    var returnStr = '<tr><td data-min-time="' + snewDate + '" colspan="' + tdNum + '"><div class="places">'
    for (var index = 0; index < tdNum; index++) {
      var date = tdate + ' ' + halfHourArr[index] + ':00',
        time = new Date(date).getTime();
      returnStr = returnStr + '<div class="place" data-min-time="' + time + '" data-date="' + date + '" style="height:' + tdHeight + 'px;"></div>';
    }
    returnStr = returnStr + '</div></td></tr>';
    return returnStr;
  }

  $.fn.GanttTool = function (options) {
    var tool = new Gantt(this, options);
    tool.initDom();
    return tool;
  }
})(jQuery, window, document);
