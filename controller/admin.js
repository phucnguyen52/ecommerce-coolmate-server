const Admin = require("../service/admin");


const reportCategoty = async(req, res) =>{
    const report = await Admin.reportCategoty(req.query);

    res.status(200).json({
        succes : true,
        message : "Báo cáo hàng hóa",
        report
    })
}


const reportSale = async(req, res) =>{
    const report = await Admin.reportSale(req.query);

    res.status(200).json({
        succes : true,
        message : "Báo cáo doanh thu",
        report
    })
}


const topSellingProduct = async(req, res) =>{
    const report = await Admin.topSellingProduct();

    res.status(200).json({
        succes : true,
        message : "Sản phẩm bán chạy",
        report
    })
}


const topUserSelling = async(req, res) =>{
    const report = await Admin.topUserSelling();

    res.status(200).json({
        succes : true,
        message : "Khách hàng vip",
        report
    })
}
module.exports = {reportCategoty, reportSale, topUserSelling, topSellingProduct}