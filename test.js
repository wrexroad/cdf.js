const CDF = require("./CDF.js");

cdf = new CDF(require("./samplecdf.json"));

let epoch_start = 306590472162849280;
cdf.addData(cdf.variables.z.EPOCH, [
  epoch_start+=1000000000,
  epoch_start+=1000000000,
  epoch_start+=1000000000,
  epoch_start+=1000000000,
  epoch_start+=1000000000,
  epoch_start+=1000000000
]);
cdf.addData(cdf.variables.z["Frame Number"], 
  [0, 1, 2, 3, 4, 5]
);
cdf.write("test.cdf");
