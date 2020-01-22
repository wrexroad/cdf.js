const CDF = require("./CDF.js");

cdf = new CDF(require("./samplecdf.json"));
cdf.write("test.cdf");
