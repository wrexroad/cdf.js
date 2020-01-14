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

CDF.DATA_TYPES = {
  1: {id: 1, name: "CDF_INT1", size: 1, typedArray: Int8Array},
  2: {id: 2, name: "CDF_INT2", size: 2, typedArray: Int16Array},
  4: {id: 4, name: "CDF_INT4", size: 4, typedArray: Int32Array},
  8: {id: 8, name: "CDF_INT8", size: 8, typedArray: BigInt64Array},
  11: {id: 11, name: "CDF_UINT1", size: 1, typedArray: Uint8Array},
  12: {id: 12, name: "CDF_UINT2", size: 2, typedArray: Uint16Array},
  14: {id: 14, name: "CDF_UINT4", size: 4, typedArray: Uint32Array},
  41: {id: 41, name: "CDF_BYTE", size: 4, typedArray: Int8Array},
  21: {id: 21, name: "CDF_REAL4", size: 4, typedArray: Float32Array},
  22: {id: 22, name: "CDF_REAL8", size: 8, typedArray: Float64Array},
  44: {id: 44, name: "CDF_FLOAT", size: 4, typedArray: Float32Array},
  45: {id: 45, name: "CDF_DOUBLE", size: 8, typedArray: Float64Array},
  31: {id: 31, name: "CDF_EPOCH", size: 8, typedArray: Float64Array},
  32: {id: 32, name: "CDF_EPOCH16", size: 16, typedArray: Float64Array},//not supported yet
  33: {id: 33, name: "CDF_TIME_TT2000", size: 8, typedArray: BigInt64Array},
  51: {id: 51, name: "CDF_CHAR", size: 1, typedArray: Uint8Array},
  52: {id: 52, name: "CDF_UCHAR", size: 1, typedArray: Uint8Array}
};
CDF.DATA_TYPES.CDF_INT1 = CDF.DATA_TYPES[1];
CDF.DATA_TYPES.CDF_INT2 = CDF.DATA_TYPES[2];
CDF.DATA_TYPES.CDF_INT4 = CDF.DATA_TYPES[4];
CDF.DATA_TYPES.CDF_INT8 = CDF.DATA_TYPES[8];
CDF.DATA_TYPES.CDF_UINT1 = CDF.DATA_TYPES[11];
CDF.DATA_TYPES.CDF_UINT2 = CDF.DATA_TYPES[12];
CDF.DATA_TYPES.CDF_UINT4 = CDF.DATA_TYPES[14];
CDF.DATA_TYPES.CDF_BYTE = CDF.DATA_TYPES[41];
CDF.DATA_TYPES.CDF_REAL4 = CDF.DATA_TYPES[21];
CDF.DATA_TYPES.CDF_REAL8 = CDF.DATA_TYPES[22];
CDF.DATA_TYPES.CDF_FLOAT = CDF.DATA_TYPES[44];
CDF.DATA_TYPES.CDF_DOUBLE = CDF.DATA_TYPES[45];
CDF.DATA_TYPES.CDF_EPOCH = CDF.DATA_TYPES[31];
CDF.DATA_TYPES.CDF_EPOCH16 = CDF.DATA_TYPES[32];
CDF.DATA_TYPES.CDF_TIME_TT2000 = CDF.DATA_TYPES[33];
CDF.DATA_TYPES.CDF_CHAR = CDF.DATA_TYPES[51];
CDF.DATA_TYPES.CDF_UCHAR = CDF.DATA_TYPES[52];

CDF.ENCODINGS = {
  1: {id: 1, name: "NETWORK_ENCODING"},
  2: {id: 1, name: "SUN_ENCODING"},
  3: {id: 1, name: "VAX_ENCODING", littleEndian: true},
  4: {id: 1, name: "DECSTATION_ENCODING", littleEndian: true},
  5: {id: 1, name: "SGi_ENCODING"},
  6: {id: 1, name: "IBMPC_ENCODING", littleEndian: true},
  7: {id: 1, name: "IBMRS_ENCODING"},
  9: {id: 1, name: "PPC_ENCODING"},
  11: {id: 1, name: "HP_ENCODING", littleEndian: true},
  12: {id: 1, name: "NeXT_ENCODING"},
  13: {id: 1, name: "ALPHAOSF1_ENCODING", littleEndian: true},
  14: {id: 1, name: "ALPHAVMSd_ENCODING", littleEndian: true},
  15: {id: 1, name: "ALPHAVMSg_ENCODING", littleEndian: true},
  16: {id: 1, name: "ALPHAVMSi_ENCODING", littleEndian: true},
  17: {id: 1, name: "ARM_LITTLE_ENCODING", littleEndian: true},
  18: {id: 1, name: "ARM_BIG_ENCODING"},
  19: {id: 1, name: "iA64VMSi_ENCODING", littleEndian: true},
  20: {id: 1, name: "iA64VMSs_ENCODING", littleEndian: true},
  21: {id: 1, name: "iA64VMSg_ENCODING", littleEndian: true}
}
CDF.ENCODINGS.NETWORK_ENCODING = CDF.ENCODINGS[1];
CDF.ENCODINGS.SUN_ENCODING = CDF.ENCODINGS[2];
CDF.ENCODINGS.VAX_ENCODING = CDF.ENCODINGS[3];
CDF.ENCODINGS.DECSTATION_ENCODING = CDF.ENCODINGS[4];
CDF.ENCODINGS.SGi_ENCODING = CDF.ENCODINGS[5];
CDF.ENCODINGS.IBMPC_ENCODING = CDF.ENCODINGS[6];
CDF.ENCODINGS.IBMRS_ENCODING = CDF.ENCODINGS[7];
CDF.ENCODINGS.PPC_ENCODING = CDF.ENCODINGS[9];
CDF.ENCODINGS.HP_ENCODING = CDF.ENCODINGS[11];
CDF.ENCODINGS.NeXT_ENCODING = CDF.ENCODINGS[12];
CDF.ENCODINGS.ALPHAOSF1_ENCODING = CDF.ENCODINGS[13];
CDF.ENCODINGS.ALPHAVMSd_ENCODING = CDF.ENCODINGS[14];
CDF.ENCODINGS.ALPHAVMSg_ENCODING = CDF.ENCODINGS[15];
CDF.ENCODINGS.ALPHAVMSi_ENCODING = CDF.ENCODINGS[16];
CDF.ENCODINGS.ARM_LITTLE_ENCODING = CDF.ENCODINGS[17];
CDF.ENCODINGS.ARM_BIG_ENCODING = CDF.ENCODINGS[18];
CDF.ENCODINGS.iA64VMSi_ENCODING = CDF.ENCODINGS[19];
CDF.ENCODINGS.iA64VMSs_ENCODING = CDF.ENCODINGS[20];
CDF.ENCODINGS.iA64VMSg_ENCODING = CDF.ENCODINGS[21];

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
  let size = 8; //start with 8 because we will skip the RecordSize field to prevent loop
  for (let name in this.fields) {
    if (name === "RecordSize") {return;}

    let
      field = this.fields.get(name),
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
Record.prototype.hasFlag = function(flg) {
  return this.fields.get("Flags").value & flg;
}
Record.prototype.setFlag = function(flg) {
  let flags = this.fields.get("Flags");
  if (!flags) {return false;}
  flags.value |= flg;
  this.fields.set("Flags", flags);

  return true;
}
Record.prototype.toBytes = function() {
  let
    buf = Buffer.alloc(this.getSize()),
    view = DataView(buf.buffer),
    offset = 0;

  for (let name in this.fields) {
    let
      field = this.fields.get(name),
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
CDR.FLAGS = {
  ROW_MAJORITY: 0b00001,
  SINGLE_FILE:  0b00010,
  HAS_CHECKSUM: 0b00100,
  USE_MD5_SUM:  0b01000,
  ANOTHER_SUM:  0b10000
}

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

function VDR() {
  this.addField("VDRnext", DATA_TYPES.BigInt64, null);
  this.addField("DataType", DATA_TYPES.Int32, null);
  this.addField("MaxRec", DATA_TYPES.Int32, -1);
  this.addField("VXRhead", DATA_TYPES.BigInt64, null);
  this.addField("VXRtail", DATA_TYPES.BigInt64, null);
  this.addField("Flags", DATA_TYPES.Int32, 0);
  this.addField("SRecrods", DATA_TYPES.Int32, null);
  this.addField("rfuB", DATA_TYPES.Int32, 0);
  this.addField("rfuC", DATA_TYPES.Int32, -1);
  this.addField("rfuF", DATA_TYPES.Int32, -1);
  this.addField("NumElems", DATA_TYPES.Int32, 1);
  this.addField("Num", DATA_TYPES.Int32, 1);
  this.addField("CPRorSPRoffset", DATA_TYPES.BigInt64, null);
  this.addField("BlockingFactor", DATA_TYPES.Int32, null);
  this.addField("Name", DATA_TYPES.ascii, "", 256);
  if (this.type == "ZVDR") {
    this.addField("zNumDims", DATA_TYPES.Int32, null);
    this.addField("zDimSizes", DATA_TYPES.Int32, null);  
  }
  this.addField("DimVarys", DATA_TYPES.Int32, 0);
  
  return this;
}
VDR.prototype.setDataType = function(dt, numElems, isPadded) {
  this.updateField("DataType", CDF.DATA_TYPES[dt].id);
  this.updateField("NumElems", numElems || 1);
  if (isPadded) {
    this.setFlag(VDR.FLAGS.PAD);
  }
}
VDR.prototype.getSize = function() {
  return (
    (this.type == "ZVDR"? 352 : 344) +
    (this.hasFlag(VDR.FLAGS.PAD) ? this.getPadBytes().length : 0)
  );
};
VDR.prototype.getPadBytes = function() {
  let hasPad = this.getFlag(VDR.FLAGS.PAD);

  if (!hasPad) {return Buffer.alloc(0)}

  let
    len = this.fields.get("NumElems").value,
    dt = CDF.DATA_TYPES[this.fields.get("DataType").value],
    pad = (new dt.typedArray(len)).fill(dt.pad);

  return pad.buffer;
}
VDR.prototype.toBytes = function() {
  let
    recBuf = Record.prototype.toBytes.call(this),
    padBuf = this.getPadBytes();
  return Buffer.concat([recBuf, padBuf], recBuf.length + padBuf.length);
}
VDR.FLAGS = {
  VARIANCE: 0b001,
  PAD: 0b010,
  COMPRESSION: 0b100
}

function RVDR(cdf) {
  Record.call(this, arguments);
  VDR.call(this, arguments);

  return this;
}
RVDR.prototype = Object.create(Record.prototype);
Object.assign(RVDR.prototype, VDR.prototype);
RVDR.prototype.constructor = RVDR;

function ZVDR(cdf) {
  Record.call(this, arguments);
  VDR.call(this, arguments);

  return this;
}
ZVDR.prototype = Object.create(Record.prototype);
Object.assign(ZVDR.prototype, VDR.prototype);
ZVDR.prototype.constructor = ZVDR;

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

function AEDR(dt, val) {
  if (!val.length) {val = [val]}

  this.addField("AEDRnext", DATA_TYPES.BigInt64, null);
  this.addField("AttrNum", DATA_TYPES.Int32, 0);
  this.addField("DataType", DATA_TYPES.Int32, CDF.DATA_TYPES[dt].id);
  this.addField("Num", DATA_TYPES.Int32, 0);
  this.addField("NumElems", DATA_TYPES.Int32, val.length);
  this.addField("NumStrings", DATA_TYPES.Int32,
    typeof val === "string"? split("\\n").length : 1
  );
  this.addField("rfuB", DATA_TYPES.Int32, 0);
  this.addField("rfuC", DATA_TYPES.Int32, 0);
  this.addField("rfuD", DATA_TYPES.Int32, -1);
  this.addField("rfuE", DATA_TYPES.Int32, -1);
  this.addField("Value", dt/*FIX THIS*/, val);
}
AEDR.prototype.getValueBytes = function() {
  let
    len = this.fields.get("NumElems").value,
    dt = CDF.DATA_TYPES[this.fields.get("DataType").value],
    value = dt.typedArray.from(this.fields.get("Value").value)
 
  return value.buffer;
}
AEDR.prototype.getSize = function() {
  return 56 + (
    this.fields.get("NumElems").value *
    CDF.DATA_TYPES[this.fields.get("DataType").value].size
  )
}
AEDR.prototype.toBytes = function() {
  let 
    rec = Record.prototype.toBytes.call(this),
    val = this.getValueBytes();
  return Buffer.concat([rec, val], rec.length + val.length)
}

function AGR_EDR(cdf) {
  Record.call(this, arguments);
  AEDR.call(this, arguments);
  return this;
}
AGR_EDR.prototype = Object.create(Record.prototype);
Object.assign(AGR_EDR.prototype, AEDR.prototype);
AGR_EDR.prototype.constructor = AGR_EDR;

function AZ_EDR(cdf) {
  Record.call(this, arguments);
  AEDR.call(this, arguments);
  return this;
}
AGR_EDR.prototype = Object.create(Record.prototype);
Object.assign(AGR_EDR.prototype, AEDR.prototype);
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

function VVR(cdf, type, data) {
  Record.call(this, arguments);

  this.addField("Records", type, data);
  
  return this;
}
VVR.prototype = Object.create(Record.prototype);
VVR.prototype.constructor = VVR;

function CCR(cdf) {
  Record.call(this, arguments);
  return this;
}
CCR.prototype = Object.create(Record.prototype);
CCR.prototype.constructor = CCR;

function CPR(cdf) {
  Record.call(this, arguments);
  return this;
}
CPR.prototype = Object.create(Record.prototype);
CPR.prototype.constructor = CPR;

function SPR(cdf) {
  Record.call(this, arguments);
  return this;
}
SPR.prototype = Object.create(Record.prototype);
SPR.prototype.constructor = SPR;

function CVVR(cdf) {
  Record.call(this, arguments);
  return this;
}
CVVR.prototype = Object.create(Record.prototype);
CVVR.prototype.constructor = CVVR;

function URI(cdf) {
  Record.call(this, arguments);
  return this;
}
URI.prototype = Object.create(Record.prototype);
URI.prototype.constructor = URI;


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