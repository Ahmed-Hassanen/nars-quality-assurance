const { promisify } = require("util");
const Competences = require("../models/competencesModel");
const catchAsync = require("../shared/utils/catchAsync");
const AppError = require("../shared/utils/appError");
const factory = require("./../shared/controllers/handlerFactory");

exports.addCompetences = catchAsync(async (req, res, next) => {
    
    const code =req.body.code;
    const competences=req.body.competences;
    let cnt=1
    const arr=[];
    for(let i=0;i<competences.length;i++) arr[i]=await Competences.create({code:code+`${cnt++}`,description:competences[i]})
    const arrid=[]
    for(let i=0;i<arr.length;i++) arrid[i]=arr[i]._id
   res.status(201).json({
    status: "success",
    ids:arrid
});
})
exports.getAll=catchAsync(async (req, res, next) => {
    
    const ids=req.body.ids;
    const view=[]
    for(let i=0;i<ids.length;i++){
    const one =await Competences.findById(ids[i]);
    if(!one){
   return next(new AppError(`No document found with that ${ids[i]}`, 404))
    }
    view[i]=one
    }
   res.status(201).json({
    status: "success",
    data:view
});
})
exports.updateCompetences = factory.updateOne(Competences)
exports.deleteOne=factory.deleteOne(Competences)
