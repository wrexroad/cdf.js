const COPYRIGHT_TEXT =
`Common Data Format (CDF)
(C) Copyright 1990-2015 NASA/GSFC
Space Physics Data Facility
NASA/Goddard Space Flight Center
Greenbelt, Maryland 20771 USA
(Internet -- GSFC-CDF-SUPPORT@LISTS.NASA.GOV)
`;

function CDF() {
  this.magic = [0xCDF30001, 0x0000FFFF];
  
  this.cdr = new CDR(this);
  this.gdr = new GDR(this);
  
  this.records = new Map();
  this.records.set(this.cdr.id, this.cdr);
  this.records.set(this.gdr.id, this.gdr);

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

CDF.prototype.addAttribute = function(attr) {
  let adr = new ADR(this);
  adr.updateField("Scope", attr.variable? 2 : 1);

  attr.grEntries.forEach((entr, i) => {
    let egr = new AGR_EDR(this);

    if (!i) {
      adr.AgrEDRheadID = egr.id;
    } else {

    }
    this.records.set(egr.id, egr);
  });
  attr.zEntries.forEach(entr => {
    let egr = new AZ_EDR(this);
  });

  this.adr.push(adr.id);
  this.records.set(adr.id, adr);
}

CDF.prototype.getOffsetOf = function(id) {
  let offset = 0;

  this.records.some(rec => {
    if (id === rec.id) {
      return true;
    } else {
      offset += rec.getSize();
      return false;
    }
  });

  return offset;
}
CDF.prototype.getTotalSize = function() {
  return this.records.recude((size, rec) => (size += rec.getSize()), 0);
}

function Record(args) {
  this.id = Math.random().toString(36).split(".")[1];
  this.type = args.callee.name;
  this.cdf = args[0];
  this.fields = new Map();
  this.addField("recordSize", DATA_TYPES.BigInt64, this.getSize);
  this.addField("recordType", DATA_TYPES.Int32, Record.TYPES[this.type]);
  
  return this;
}
Record.prototype.getSize = function(){
  let size = 0;
  for (let name in this.fields) {
    let
      field = this.fields[name],
      type = field.type,
      value = field.value,
      numEls = field.fixedWidth || value.length;

    //check if the field evaluates to an array
    if (typeof value === "function") {
      value = value();
    }
  
    //add the size of the field (could be an array of values)
    size += numEls !== undefined? type.size*numEls : type.size;
  }

  return size;
};
Record.prototype.addField = function(name, type, value, fixedWidth) {
  let f = {value, fixedWidth};
  f.__proto__ = type;
  
  this.fields.set(name, f);
  return this;
}
Record.prototype.updateField = function(name, value) {
  let field = this.fields.get(name);
  field.value = value;

  this.fields.set(name, field);
  return this;
}
Record.prototype.toBytes = function() {
  let
    buf = Buffer.alloc(this.getSize()),
    view = DataView(buf.buffer),
    offset = 0;

  for (let name in this.fields) {
    let
      field = this.fields[name],
      type = field.type,
      value = field.value,
      numEls = field.fixedWidth || value.length;

    //a field might be a reference to another record
    //or a function that needs to be evaluated
    if (value instanceof Record) {
      value = this.cdf.getOffsetOf(value.id)
    } else if (typeof value === "function") {
      value = value();
    }

    if (numEls) {
      //make sure we arent about to treat a scalar as an array
      if (value.length === undefined) {
        value = [].concat(value);
      }

      for (let val_i=0; val_i < value.length && val_i < numEls; val_i++) {
        type.setter.call(view, offset, val_i);
        offset += type.size;
      }
      //if fixed width, pad the offset if needed
      if (numEls > value.length) {
        offset += numEls - value.length;
      }

    } else if (numEls === undefined) {//make sure to ignore values with length===0
      type.setter.call(view, offset, value || 0);
      offset += type.size;
    }
  }
  console.log(buf, view);
  return buf;
}

function LinkedRecord() {
  this.nextID = 0;
  return this;
}
LinkedRecord.prototype.next = function() {
  return this.cdf.getOffsetOf(this.next);
}
LinkedRecord.prototype.linkNextRecord = function(id) {
  this.nextID = id;
}

function CDR(cdf) {
  Record.call(this, arguments);

  this.addField("GDRoffset", DATA_TYPES.BigInt64, 312);
  this.addField("Version", DATA_TYPES.Int32, 3);
  this.addField("Release", DATA_TYPES.Int32, 7);
  this.addField("Flags", DATA_TYPES.Int32, 0b01110);
  this.addField("Encoding", DATA_TYPES.Int32, 6);
  this.addField("rfuA", DATA_TYPES.Int32, 0);
  this.addField("rfuB", DATA_TYPES.Int32, 0);
  this.addField("Increment", DATA_TYPES.Int32, 0);
  this.addField("Identifier", DATA_TYPES.Int32, 3);
  this.addField("rfuE", DATA_TYPES.Int32, -1);
  this.addField("Copyright", DATA_TYPES.ascii, COPYRIGHT_TEXT, 256);
  
  return this;
}
CDR.prototype = Object.create(Record.prototype);
CDR.prototype.constructor = CDR;
CDR.prototype.getSize = function() {return 312;}

function GDR(cdf) {
  Record.call(this, arguments);

  this.addField("rVDRhead", DATA_TYPES.BigInt64, null);
  this.addField("zVDRhead", DATA_TYPES.BigInt64, null);
  this.addField("ADRhead", DATA_TYPES.BigInt64, null);
  this.addField("eof", DATA_TYPES.BigInt64, this.cdf.getTotalSize);
  this.addField("NrVars", DATA_TYPES.Int32, 0);
  this.addField("NumAttr", DATA_TYPES.Int32, 0);
  this.addField("rMaxRec", DATA_TYPES.Int32, 0);
  this.addField("rNumDims", DATA_TYPES.Int32, 0);
  this.addField("NzVars", DATA_TYPES.Int32, 0);
  this.addField("URIhead", DATA_TYPES.BigInt64, 0);
  this.addField("rfuC", DATA_TYPES.Int32, 0);
  this.addField("LeapSecondLastUpdated", DATA_TYPES.Int32, 0);
  this.addField("rfuE", DATA_TYPES.Int32, -1);
  this.addField("rDimSizes", DATA_TYPES.Int32, []);
  
  return this;
}
GDR.prototype = Object.create(Record.prototype);
GDR.prototype.constructor = GDR;
GDR.prototype.getSize = function() {
 return 84 + this.fields("rNumDims").value;
};

function RVDR(cdf) {
  Record.call(this, arguments);
  
  this.addField("VDRnext", DATA_TYPES.BigInt64, null);
  this.addField("DataType", DATA_TYPES.Int32, null);
  this.addField("MaxRec", DATA_TYPES.Int32, null);
  this.addField("VXRhead", DATA_TYPES.BigInt64, null);
  this.addField("VXRtail", DATA_TYPES.BigInt64, null);
  this.addField("Flags", DATA_TYPES.Int32, null);
  this.addField("SRecrods", DATA_TYPES.Int32, null);
  this.addField("rfuB", DATA_TYPES.Int32, 0);
  this.addField("rfuC", DATA_TYPES.Int32, -1);
  this.addField("rfuF", DATA_TYPES.Int32, -1);
  this.addField("NumElems", DATA_TYPES.Int32, -1);
  this.addFIeld("CPRorSPRoffset", DATA_TYPES.BigInt64, null);
  this.addField("NumElems", DATA_TYPES.Int32, -1);
  this.addField("BlockingFactor", DATA_TYPES.Int32, null);// 4 bytes Offset:80
  this.addField("Name", DATA_TYPES.ascii, "", 256);// 256 bytes Offset:84. Was 64 bytes in earlier V2.*
  this.addField("zNumDims", DATA_TYPES.Int32, null);// 4 bytes Offset:340 if a zVDR. Not present if an rVDR.
  this.addField("zDimSizes", DATA_TYPES.Int32, null);
  this.addField("DimVarys", DATA_TYPES.Int16, null);// 4 bytes Size depends on the zNumDims field if a zVDR (but not present if zero
  this.addField("PadValue", DATA_TYPES.Int16, null);// Variable Size depends on DataType and NumElems fields. Not present if bit 1 of
  this.addField("Flags", DATA_TYPES.Int16, null);// field is not set.
  
  return this;
}
RVDR.prototype = Object.create(Record.prototype);
RVDR.prototype.constructor = RVDR;

function ADR(cdf) {
  Record.call(this, arguments);

  this.addField("ADRnext", DATA_TYPES.BigInt64, null);
  this.addField("AgrEDRhead", DATA_TYPES.BigInt64, null);
  this.addField("Scope", DATA_TYPES.Int32, 1);
  this.addField("Num", DATA_TYPES.Int32, 0);
  this.addField("NgrEntries", DATA_TYPES.Int32, 0);
  this.addField("MAXgrEntry", DATA_TYPES.Int32, 0);
  this.addField("rfuA", DATA_TYPES.Int32, 0);
  this.addField("AzEDRhead", DATA_TYPES.BigInt64, null);
  this.addField("NzEntries", DATA_TYPES.Int32, 0);
  this.addField("MAXzEntry", DATA_TYPES.Int32, 0);
  this.addField("rfuE", DATA_TYPES.Int32, -1);
  this.addField("Name", DATA_TYPES.ascii, "", 256);
  
  return this;
}
ADR.prototype = Object.create(Record.prototype);
ADR.prototype.constructor = ADR;
ADR.prototype.getSize = function() {return 324;}

function AGR_EDR(cdf) {
  Record.call(this, arguments);
  
  Object.defineProperties(this, {
    size: {
      get: 
    }
  });
  return this;
}
AGR_EDR.prototype = Object.create(Record.prototype);
AGR_EDR.prototype.constructor = AGR_EDR;

function VXR(cdf) {
  Record.call(this, arguments);
  
  this.addField("VXRnext", DATA_TYPES.BigInt64, 0);
  this.addField("Nentries", DATA_TYPES.Int32, VXR.N_ENTRIES);
  this.addField("NusedEntries", DATA_TYPES.Int32, 0);
  this.addField("First", DATA_TYPES.Int32,
    (new Array(VXR.N_ENTRIES)).fill(0xFFFFFFFF), VXR.N_ENTRIES
  );
  this.addField("Last", DATA_TYPES.Int32,
    (new Array(VXR.N_ENTRIES)).fill(0xFFFFFFFF), VXR.N_ENTRIES
  );
  this.addField("Offset", DATA_TYPES.BigInt64,
    (new Array(VXR.N_ENTRIES)).fill(0xFFFFFFFFFFFFFFFF), VXR.N_ENTRIES
  );

  return this;
}
VXR.prototype = Object.create(Record.prototype);
VXR.prototype.constructor = VXR;
VXR.prototype.getSize = function(){return 28 + (this.numEntries*16)};
VXR.prototype.addEntry = function(rec) {
  let entry_i = this.fields.get("NusedEntries");
    
  if (entry_i === VXR.N_ENTRIES) {
    return false;
  }

  if (rec instanceof VVR) {
    let
      first = this.fields.get("First"),
      last = this.fields.get("Last"),
      offset = this.fields.get("Offset");

    first[entry_i] = rec.first;
    last[entry_i] = rec.last;
    offset[entry_i] = rec.id;

    this.updateField("First", first);
    this.updateField("Last", last);
    this.updateField("Offset", offset);
    this.updateField("NusedEntries", entry_i++);
  }

  return entry_i;
}
VXR.N_ENTRIES = 7;

function VVR(cdf) {
  Record.call(this, arguments);
  
  Object.defineProperties(this, {
    size: {
      get: 
    }
  });
  return this;
}
VVR.prototype = Object.create(Record.prototype);
VVR.prototype.constructor = VVR;

function ZVDR(cdf) {
  Record.call(this, arguments);
  
  Object.defineProperties(this, {
    size: {
      get: 
    }
  });
  return this;
}
ZVDR.prototype = Object.create(Record.prototype);
ZVDR.prototype.constructor = ZVDR;

function AZ_EDR(cdf) {
  Record.call(this, arguments);
  
  Object.defineProperties(this, {
    size: {
      get: 
    }
  });
  return this;
}
AZ_EDR.prototype = Object.create(Record.prototype);
AZ_EDR.prototype.constructor = AZ_EDR;

function CCR(cdf) {
  Record.call(this, arguments);
  
  Object.defineProperties(this, {
    size: {
      get: 
    }
  });
  return this;
}
CCR.prototype = Object.create(Record.prototype);
CCR.prototype.constructor = CCR;

function CPR(cdf) {
  Record.call(this, arguments);
  
  Object.defineProperties(this, {
    size: {
      get: 
    }
  });
  return this;
}
CPR.prototype = Object.create(Record.prototype);
CPR.prototype.constructor = CPR;

function SPR(cdf) {
  Record.call(this, arguments);
  
  Object.defineProperties(this, {
    size: {
      get: 
    }
  });
  return this;
}
SPR.prototype = Object.create(Record.prototype);
SPR.prototype.constructor = SPR;

function CVVR(cdf) {
  Record.call(this, arguments);
  
  Object.defineProperties(this, {
    size: {
      get: 
    }
  });
  return this;
}
CVVR.prototype = Object.create(Record.prototype);
CVVR.prototype.constructor = CVVR;

function URI(cdf) {
  Record.call(this, arguments);
  
  Object.defineProperties(this, {
    size: {
      get: 
    }
  });
  return this;
}
URI.prototype = Object.create(Record.prototype);
URI.prototype.constructor = URI;


function Field(name, type, value) {
  this.name = name;
  this.type = type;
  this.value = value;0



  return this;
}
Field.prototype.toBytes = function() {
  return 
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
const DATA_TYPES = {
  
  Int8: {
    size: 1,
    getter: DataView.prototype.getInt8,
    setter: DataView.prototype.setInt8
  },
  Int16: {
    size: 2,
    getter: DataView.prototype.getInt16,
    setter: DataView.prototype.setInt16
  },
  Int32: {
    size: 4,
    getter: DataView.prototype.getInt32,
    setter: DataView.prototype.setInt32
  },
  BigInt64: {
    size: 8,
    getter: DataView.prototype.getBigInt64,
    setter: DataView.prototype.setBigInt64
  },
  Uint8: {
    size: 1,
    getter: DataView.prototype.getUint8,
    setter: DataView.prototype.setUint8
  },
  Uint16: {
    size: 2,
    getter: DataView.prototype.getUint16,
    setter: DataView.prototype.setUint16
  },
  Uint32: {
    size: 4,
    getter: DataView.prototype.getUint32,
    setter: DataView.prototype.setUint32
  },
  BigUInt64: {
    size: 8,
    getter: DataView.prototype.getBigUInt64,
    setter: DataView.prototype.setBigUInt64
  },
  ascii: {
    size: 1,
    getter: DataView.prototype.getUint8,
    setter: DataView.prototype.setUint8
  }
}