var URLS={
    warehouseDefine: {
        store:'/warehouseDefine/store',
        update:'/warehouseDefine/update',
        show:'/warehouseDefine/show',
        destroy: '/warehouseDefine/destroy',
        pageIndex: '/warehouseDefine/pageIndex',
        select: '/warehouseDefine',
        allshow: '/warehouseDefine/allshow',
        unique: '/warehouseDefine/unique'
    },
    BeiJianInOutType: {
        store:'/BeiJianInOutType/store',
        update:'/BeiJianInOutType/update',
        show:'/BeiJianInOutType/show',
        destroy: '/BeiJianInOutType/destroy',
        pageIndex: '/BeiJianInOutType/pageIndex',
        select: '/BeiJianInOutType',
        allshow: '/BeiJianInOutType/allshow',
        unique: '/BeiJianInOutType/unique'
    },
    deviceTeam: {
        store:'/deviceTeam/store',
        update:'/deviceTeam/update',
        show:'/deviceTeam/show',
        destroy: '/deviceTeam/destroy',
        pageIndex: '/deviceTeam/pageIndex',
        select: '/deviceTeam',
        allshow: '/deviceTeam/allshow',
        unique: '/deviceTeam/unique'
    },
    deviceDepartment: {
        store:'/deviceDepartment/store',
        storeBatch:'/deviceDepartment/storeBatch',
        update:'/deviceDepartment/update',
        show:'/deviceDepartment/show',
        destroy: '/deviceDepartment/destroy',
        treeIndex: '/deviceDepartment/treeIndex',
        unique: '/deviceDepartment/unique'
    },
    deviceType: {
        store:'/devicetype/store',
        storeBatch:'/devicetype/storeBatch',
        update:'/devicetype/update',
        show:'/devicetype/show',
        destroy: '/devicetype/destroy',
        treeIndex: '/devicetype/treeIndex',
        unique: '/devicetype/unique'
    },
    faultType: {
        store:'/faulttype/store',
        update:'/faulttype/update',
        show:'/faulttype/show',
        destroy: '/faulttype/destroy',
        treeIndex: '/faulttype/treeIndex',
        unique: '/faulttype/unique'
    },
    otherOption: {
        store:'/otheroption/store',
        update:'/otheroption/update',
        show:'/otheroption/show',
        destroy: '/otheroption/destroy',
        pageIndex: '/otheroption/pageIndex',
        select: '/otheroption',
        allshow: '/otheroption/allshow',
        unique: '/otheroption/unique'
    },
    upkeeRequire: {
        store:'/upkeerequire/store',
        update:'/upkeerequire/update',
        show:'/upkeerequire/show',
        destroy: '/upkeerequire/destroy',
        pageIndex: '/upkeerequire/pageIndex',
        select: '/upkeerequire'
    },
    upkeeExpreience: {
        store:'/upkeeexpreience/store',
        update:'/upkeeexpreience/update',
        show:'/upkeeexpreience/show',
        destroy: '/upkeeexpreience/destroy',
        pageIndex: '/upkeeexpreience/pageIndex'
    },
    spareParts:{
        store:'/sparelist/store',
        update:'/sparelist/update',
        show:'/sparelist/show',
        destroy: '/sparelist/destroy',
        pageIndex: '/sparelist/pageIndex',
        unique: '/sparelist/unique',
        // selectSpare:'/storageinve/pageIndex',
        sparelist:'/sparelist/pageIndex'

    },
    device:{
        store:'/devicelist/store',
        list:'/devicelist',
        destroy:'/devicelist/destroy',
        update:'/devicelist/update',
        show:'/devicelist/show',
        unique: '/devicelist/unique',
        pageIndex:'/devicelist/pageIndex',
        selects:'/devicelist/selects',
        department:'/Department/treeIndex',
        chargeShow:'/basedata/employeeShow',
        getpartners:'/basedata/vendorShow',
        getWorkShop:'/basedata/departmentList?',
    },
    deviceRepair: {
        store:'/deviceRepair/store',
        list:'/deviceRepair',
        destroy:'/deviceRepair/destroy',
        update:'/deviceRepair/update',
        show:'/deviceRepair/show',
        unique: '/deviceRepair/unique',
        pageIndex:'/deviceRepair/pageIndex',
        selects:'/deviceRepair/selects',
        department:'/Department/treeIndex',
        chargeShow:'/basedata/employeeShow',
        getpartners:'/basedata/partnerShow',
    },
    deviceMember: {
        store:'/deviceMember/store',
        list:'/deviceMember',
        destroy:'/deviceMember/destroy',
        update:'/deviceMember/update',
        show:'/deviceMember/show',
        unique: '/deviceMember/unique',
        pageIndex:'/deviceMember/pageIndex',
        selects:'/deviceMember/selects',
        department:'/Department/treeIndex',
        chargeShow:'/basedata/employeeShow',
        getpartners:'/basedata/partnerShow',
    },
    repairs:{
        employee:'/Employee/pageIndex',
        store:'/repairslist/store',
        pageIndex:'/repairslist/pageIndex',
    },

/************************ 批量删除 url 7/29 start **************************/
    all: {
        del: '/devicelist/batchDelete',
    }

/********************************** end ************************************/

};