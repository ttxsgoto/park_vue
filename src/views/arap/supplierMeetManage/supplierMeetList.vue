<style scoped lang="less">


</style>
<template>
  <div>
    <div class="nav-tab">
      <el-tabs v-model="activeName" type="card" @tab-click="handleClick">
        <el-tab-pane label="供应商应付账款" name="meet">
          <div class="tab-screen">
            <el-form class="search-filters-form" label-width="80px" :model="searchFilters" status-icon>
              <el-row :gutter="0">
                <el-col :span="12">
                  <el-input placeholder="请输入" v-model="searchFilters.keyword" @keyup.native.13="startSearch" class="search-filters-screen">
                    <el-select v-model="searchFilters.field" slot="prepend" placeholder="请选择">
                      <el-option v-for="(item,key) in selectData.fieldSelect" :key="key" :label="item.value" :value="item.id"></el-option>
                    </el-select>
                    <el-button slot="append" icon="el-icon-search" @click="startSearch"></el-button>
                  </el-input>
                </el-col>
              </el-row>
              <el-row :gutter="30">
                <el-col :span="10">
                  <el-form-item label="开始日期:">
                    <el-date-picker v-model="activeTime" type="datetimerange" @change="startSearch" :clearable="false" range-separator="至" start-placeholder="开始日期" end-placeholder="结束日期" value-format="yyyy-MM-dd HH:mm:ss" :default-time="['16:00:00','16:00:00']"></el-date-picker>
                    <!-- <el-row :gutter="0">
                      <el-col :span="11">
                        <el-date-picker v-model="startTime" type="month" placeholder="选择开始月" :clearable="false" value-format="yyyy-MM-dd HH:mm:ss" @change="dateSelect"></el-date-picker>
                      </el-col>
                      <el-col :span="2" class="text-center">-</el-col>
                      <el-col :span="11">
                        <el-date-picker v-model="endTime" type="month" placeholder="选择结束月" :clearable="false" value-format="yyyy-MM" @change="dateSelect('end')">
                        </el-date-picker>
                      </el-col>
                    </el-row> -->
                  </el-form-item>
                </el-col>
              </el-row>
              </el-row>
            </el-form>
          </div>
          <div class="operation-btn text-right">
            <!-- <el-button type="primary" plain @click="importList">导入</el-button> -->
            <export-button :export-type="exportType" :export-post-data="exportPostData" :export-api-name="'exportSupplierMeetData'"></export-button>
          </div>
          <div class="table-list">
            <el-table :data="tableData" stripe style="width: 100%" size="mini" max-height="600" v-loading="pageLoading" :class="{'tabal-height-500':!tableData.length}">
              <el-table-column v-for="(item,key) in thTableList" :key="key" :prop="item.param" align="center" :width="item.width?item.width:140" :label="item.title">
              </el-table-column>
            </el-table>
            <no-data v-if="!pageLoading && !tableData.length"></no-data>
          </div>
          <div class="page-list text-center">
            <el-pagination background layout="prev, pager, next, jumper" :total="pageData.totalCount" :page-size="pageData.pageSize" :current-page.sync="pageData.currentPage" @current-change="pageChange" v-if="!pageLoading && pageData.totalCount>10">
            </el-pagination>
          </div>
        </el-tab-pane>
        <el-tab-pane label="付款管理" name="payment"></el-tab-pane>
      </el-tabs>
    </div>
  </div>
</template>
<script>
export default {
  name: 'supplierMeetList',

  computed: {

  },
  data() {
    return {
      pageLoading: false,
      pageData: {
        currentPage: 1,
        totalCount: '',
        pageSize: 20,
      },
      activeTime: [],
      activeName: 'meet',
      searchPostData: {}, //搜索参数
      searchFilters: {
        field: 'supplier_name',
      },
      selectData: {
        fieldSelect: [
          { id: 'supplier_name', value: '供应商' },
        ],
        supplierSelect: [] //供应商
      },
      startTime: '', //开始日期
      endTime: '', //结束日期
      thTableList: [{
        title: '供应商',
        param: 'supplier_name',
        width: '200'
      }, {
        title: '期初余额',
        param: 'first_amount',
        width: ''
      }, {
        title: '装车数',
        param: 'car_no',
        width: ''
      }, {
        title: '装车吨位',
        param: 'active_tonnage',
        width: ''
      }, {
        title: '采购优惠后总额',
        param: 'discounts_sum_price',
        width: ''
      }, {
        title: '调账金额',
        param: 'change_amount',
        width: ''
      }, {
        title: '付款金额',
        param: 'total_amount',
        width: ''
      }, {
        title: '期末余额',
        param: 'last_amount',
        width: ''
      }, {
        title: '期初欠票金额',
        param: 'first_debt_amount',
        width: ''
      }, {
        title: '收票金额',
        param: 'receive_amount',
        width: ''
      }, {
        title: '期末欠票金额',
        param: 'last_detb_amount',
        width: ''
      }],
      tableData: [],
      exportPostData: {}, //导出筛选
      exportType: {
        type: 'supplier-pay',
        filename: '供应商应付管理',
        isPage: true,
        pageSize: 20,
      },
    }
  },
  methods: {
    startSearch: function() {
      this.pageData.currentPage = 1;
      this.searchPostData = this.pbFunc.deepcopy(this.searchFilters);
      this.getList();
    },
    dateSelect(type) {
      let dates = this.endTime.split('-');
      let days = (new Date(dates[0], dates[1], 0)).getDate();
      if (type === 'end') {
        this.endTime = this.endTime + '-' + days + ' 23:59:59';
      }
      let endDate = this.pbFunc.compareDate(this.startTime, this.endTime);
      if (endDate) {
        this.startSearch();
      } else {
        this.$message.warning('结束日期小于开始日期');
      }

    },
    getList: function() {
      let postData = {
        page: this.pageData.currentPage,
        page_size: this.pageData.pageSize,
        // active_time_start: this.startTime,
        // active_time_end: this.endTime,
      };
      if (this.activeTime&&this.activeTime.length) {
        postData.active_time_start = this.activeTime[0];
        postData.active_time_end = this.activeTime[1];
      }else{
        this.activeTime = [this.startTime, this.endTime];
        postData.active_time_start = this.activeTime[0];
        postData.active_time_end = this.activeTime[1];
      }
      postData[this.searchPostData.field] = this.searchPostData.keyword;
      postData = this.pbFunc.fifterObjIsNull(postData);
      // postData[this.searchFilters.field] = this.searchFilters.keyword;

      this.pageLoading = true;
      this.exportPostData = postData

      this.$$http('getSupplierMeetList', postData).then((results) => {
        this.pageLoading = false;
        if (results.data && results.data.code == 0) {
          this.tableData = results.data.data.data;
          this.pageData.totalCount = results.data.data.count;
        }
      }).catch((err) => {
        this.pageLoading = false;
      })

    },
    getSupplier: function() {
      let postData = {
        need_all: true,
      }
      this.$$http('searchSupplierList', postData).then((results) => {
        if (results.data && results.data.code == 0) {
          this.selectData.supplierSelect = results.data.data;
        }
      }).catch((err) => {})
    },
    handleClick: function(tab, event) {
      if (tab.name === 'payment') {
        this.$router.push({ path: "/arap/supplierMeetManage/paymentManage" });
      }
    },

    pageChange: function() {
      setTimeout(() => {
        this.getList();
      })
    },
    payerDate() {
      let payDate = new Date();
      let days = (new Date(payDate.getFullYear(), payDate.getMonth(), 0)).getDate();
      this.startTime = payDate.getFullYear() + '-' + (payDate.getMonth()) + '-' + days + ' 16:00:00';
      // this.endTime = payDate.getFullYear() + '-' + (payDate.getMonth() + 1) + '-' + days + ' 23:23:59';
      this.endTime = payDate.Format("yyyy-MM-dd hh:mm:ss");
      this.activeTime = [this.startTime, this.endTime];
    }
  },
  activated() {
    this.activeName = 'meet'
  },
  created: function() {
    this.pbFunc.format();
    this.payerDate();
    this.getList();
    this.getSupplier();
  }
}

</script>
