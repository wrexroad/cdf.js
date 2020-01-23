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

cdf.write("test.cdf");
