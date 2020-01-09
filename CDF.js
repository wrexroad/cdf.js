const COPYRIGHT_TEXT = `
Common Data Format (CDF)
(C) Copyright 1990-2015 NASA/GSFC
Space Physics Data Facility
NASA/Goddard Space Flight Center
Greenbelt, Maryland 20771 USA
(Internet -- GSFC-CDF-SUPPORT@LISTS.NASA.GOV)
`;

function CDF() {
  this.magic = [0xCDF30001, 0x0000FFFF];

  this.cdr = new Record("CDR");
  this.gdr = new Record("GDR");
  return this;
}

CDF.prototype.setVersion = function(ver, rev, sub) {
  if (ver === 3) {
    this.magic[0] = 0xCDF30001;
  } else if (ver === 2) {
    if (rev >= 6) {
      this.magic[0] = 0xCDF26002;
    } else {
      this.magic = [0x0000FFFF, 0x0000FFFF];
    }
  }
}

CDF.prototype.setCompression = function(isCompressed, method) {
  if (isCompressed) {
    this.magic[1] = 0xCCCC0001;
  } else {
    this.magic[1] = 0x0000FFFF;
  }
}

function Record() {
  this.fields = new Map();
  return this;
}
Record.prototype.type = 0;
Record.prototype.size = 0;
Record.prototype.toBytes = function() {
  let
    buf = Buffer.alloc(this.size),
    view = DataView(buf.buffer);

  console.log(buf, view);
}

function CDR() {
  Record.call(this);

  this.fields.set("GDRoffset", {size: this.size, type: "BigInt64", value: 312}),
  this.fields.set("Version", {size: this.size, type: "BigInt64", value: 312}),
  this.fields.set("Release", {size: this.size, type: "BigInt64", value: 312}),
  this.fields.set("Encoding", {size: this.size, type: "BigInt64", value: 312}),
  this.fields.set("Flags", {size: this.size, type: "BigInt64", value: 312}),
  this.fields.set("rfuA", {size: this.size, type: "BigInt64", value: 0}),
  this.fields.set("rfuB", {size: this.size, type: "BigInt64", value: 0}),
  this.fields.set("Increment", {size: this.size, type: "BigInt64", value: 312}),
  this.fields.set("Identifier", {size: this.size, type: "BigInt64", value: 312}),
  this.fields.set("rfuE", {size: this.size, type: "BigInt64", value: -1}),
  this.fields.set("Copyright", {size: 256, type: "ascii", value: COPYRIGHT_TEXT})
  ];

  return this;
}
CDR.prototype = Object.create(Record.prototype);
CDR.prototype.constructor = CDR;
CDR.prototype.type = 1;
CDR.prototype.getSize = function() {return 312;}

function GDR() {
  Record.call(this);
  
  Object.defineProperties(this, {
    size: {get: () => 312}
  });
  return this;
}
GDR.prototype = Object.create(Record.prototype);
GDR.prototype.constructor = GDR;
GDR.prototype.type = 2;

function RVDR() {
  Record.call(this);
  
  Object.defineProperties(this, {
    size: {
      get: 
    }
  });
  return this;
}
RVDR.prototype = Object.create(Record.prototype);
RVDR.prototype.constructor = RVDR;
RVDR.prototype.type = 3;

function ADR() {
  Record.call(this);
  
  Object.defineProperties(this, {
    size: {
      get: 
    }
  });
  return this;
}
ADR.prototype = Object.create(Record.prototype);
ADR.prototype.constructor = ADR;
ADR.prototype.type = 4;

function AGR_EDR() {
  Record.call(this);
  
  Object.defineProperties(this, {
    size: {
      get: 
    }
  });
  return this;
}
AGR_EDR.prototype = Object.create(Record.prototype);
AGR_EDR.prototype.constructor = AGR_EDR;
AGR_EDR.prototype.type = 5;

function VXR() {
  Record.call(this);
  
  Object.defineProperties(this, {
    size: {
      get: 
    }
  });
  return this;
}
VXR.prototype = Object.create(Record.prototype);
VXR.prototype.constructor = VXR;
VXR.prototype.type = 6;

function VVR() {
  Record.call(this);
  
  Object.defineProperties(this, {
    size: {
      get: 
    }
  });
  return this;
}
VVR.prototype = Object.create(Record.prototype);
VVR.prototype.constructor = VVR;
VVR.prototype.type = 7;

function ZVDR() {
  Record.call(this);
  
  Object.defineProperties(this, {
    size: {
      get: 
    }
  });
  return this;
}
ZVDR.prototype = Object.create(Record.prototype);
ZVDR.prototype.constructor = ZVDR;
ZVDR.prototype.type = 8;

function AZ_EDR() {
  Record.call(this);
  
  Object.defineProperties(this, {
    size: {
      get: 
    }
  });
  return this;
}
AZ_EDR.prototype = Object.create(Record.prototype);
AZ_EDR.prototype.constructor = AZ_EDR;
AZ_EDR.prototype.type = 9;

function CCR() {
  Record.call(this);
  
  Object.defineProperties(this, {
    size: {
      get: 
    }
  });
  return this;
}
CCR.prototype = Object.create(Record.prototype);
CCR.prototype.constructor = CCR;
CCR.prototype.type = 10;

function CPR() {
  Record.call(this);
  
  Object.defineProperties(this, {
    size: {
      get: 
    }
  });
  return this;
}
CPR.prototype = Object.create(Record.prototype);
CPR.prototype.constructor = CPR;
CPR.prototype.type = 11;

function SPR() {
  Record.call(this);
  
  Object.defineProperties(this, {
    size: {
      get: 
    }
  });
  return this;
}
SPR.prototype = Object.create(Record.prototype);
SPR.prototype.constructor = SPR;
SPR.prototype.type = 12;

function CVVR() {
  Record.call(this);
  
  Object.defineProperties(this, {
    size: {
      get: 
    }
  });
  return this;
}
CVVR.prototype = Object.create(Record.prototype);
CVVR.prototype.constructor = CVVR;
CVVR.prototype.type = 13;

function URI() {
  Record.call(this);
  
  Object.defineProperties(this, {
    size: {
      get: 
    }
  });
  return this;
}
URI.prototype = Object.create(Record.prototype);
URI.prototype.constructor = URI;
URI.prototype.type = -1;


function Field(name, type, value) {
  this.name = name;
  this.type = type;
  this.value = value;



  return this;
}
Field.prototype.toBytes = function() {
  return 
}

FieldCollections = {
  
  GDR: function() {
    return [
      ["rVDRhead", "BigInt64", 0],
      ["zVDRhead", "BigInt64", 0],
      ["ADRhead", "BigInt64", 0],
      ["eof", "BigInt64", 0],
      ["NrVars", "Int32", 0],
      ["NumAttr", "Int32", 0],
      ["rMaxRec", "Int32", 0],
      ["rNumDims", "Int32", 0],
      ["NzVars", "Int32", 0],
      ["UIRhead", "BigInt64", 0],
      ["rfuC", "Int32", 0],
      ["LeapSecondLastUpdated", "Int32", 0],
      ["rfuE", "Int32", 0],
      ["rDimSizes", "Int32", [], 0]
    ];
  },
  
}
Record.TYPES = {
  CDR: 1,
  GDR: 2,
  RVDR: 3,
  ADR: 4,
  AGR_EDR: 5,
  VXR: 6,
  VVR: 7,
  ZVDR: 8,
  AZ_EDR: 9,
  CCR: 10,
  CPR: 11,
  SPR: 12,
  CVVR: 13,
  URI: -1
};