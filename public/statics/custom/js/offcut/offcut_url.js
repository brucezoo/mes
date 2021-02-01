var URLS ={
    Offcut:{
       unique:'/Offcut/unique',
       store:'/Offcut/store',
       show:'/Offcut/show',
       update:'/Offcut/update',
       delete:'/Offcut/destroy',
       pageIndex:'/Offcut/pageIndex',
       selete:'/Offcut',
       factory: '/Factory/select',
       employeeFactory: '/Factory/selectEmployeeFactory',
       employeeShow: '/basedata/employeeShow'
    },
    OffcutWeight:{
        unique:'/OffcutWeright/unique',
        store:'/OffcutWeright/store',
        show:'/OffcutWeright/show',
        update:'/OffcutWeright/update',
        delete:'/OffcutWeright/destroy',
        pageIndex:'/OffcutWeright/pageIndex',
        device:'/devicelist',
        send:'/Sap/pushOffcutWeright',
    },

    weigh:{
        data:'/Weight/selectWeight',
        list:'/Weight/getAllWeight',
        del:'/Weight/deleteWeight',
        set:'/Weight/updateWeight',
        get:'/Weight/getZwgt',
        sub:'/Weight/commitWeight',
        kw:'/Weight/getBoxWeight',
        ts:'/Weight/weightPush'
    }
};
