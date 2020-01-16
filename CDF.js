const COPYRIGHT_TEXT =
`Common Data Format (CDF)
(C) Copyright 1990-2015 NASA/GSFC
Space Physics Data Facility
NASA/Goddard Space Flight Center
Greenbelt, Maryland 20771 USA
(Internet -- GSFC-CDF-SUPPORT@LISTS.NASA.GOV)
`;

function CDF(skel) {
  this.skel = Object.create(skel);
  if (!this.skel.zVars) {this.skel.zVars = []}
  if (!this.skel.rVars) {this.skel.rVars = []}

  this.attributes = {
    g: CDF.getAttributeSet(this.skel.meta),
    z: CDF.getAttributeSet(this.skel.zVars),
    r: CDF.getAttributeSet(this.skel.rVars)
  }
  
  this.magic = [0xCDF30001, 0x0000FFFF];
  
  this.cdr = new CDR(this);
  this.gdr = new GDR(this);
  
  this.records = new Map();
  this.records.set(this.cdr.id, this.cdr);
  this.records.set(this.gdr.id, this.gdr);

  return this;
}

CDF.getAttributeSet = function(entries) {
  let set = new Set();

  if (entries.length === undefined) {
    entries = [entries];
  }

  entries.forEach(entry => {
    let
      attr = entry.attributes,
      type = entry.type;

    Object.keys(attr).forEach(name => {
      let val = attr[name];
      if (typeof val === "string") {
        set.add({name, val, type: "CDF_CHAR"})
      } else if (val.type) {
        set.add(val);
      } else {
        set.add({name, val, type})
      }
    });
  });

  return set;
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

  for(let rec of this.records) {
    if (id === rec[0]) {
      break;
    } else {
      offset += rec[1].getSize();
    }
  }

  return offset;
}
CDF.prototype.getTotalSize = function() {
  let size = 0;

  for(let rec of this.records) {
    size += rec[1].getSize();
  }

  return size;  
}

CDF.DATA_TYPES = {
  1: {
    id: 1, name: "CDF_INT1", size: 1,
    typedArray: Int8Array,
    viewGet: DataView.prototype.getInt8,
    viewSet: DataView.prototype.setInt8
  },
  2: {
    id: 2, name: "CDF_INT2", size: 2,
    typedArray: Int16Array,
    viewGet: DataView.prototype.getInt16,
    viewSet: DataView.prototype.setInt16
  },
  4: {
    id: 4, name: "CDF_INT4", size: 4,
    typedArray: Int32Array,
    viewGet: DataView.prototype.getInt32,
    viewSet: DataView.prototype.setInt32
  },
  8: {
    id: 8, name: "CDF_INT8", size: 8,
    typedArray: BigInt64Array,
    viewGet: DataView.prototype.getBigInt64,
    viewSet: DataView.prototype.setBigInt64
  },
  11: {
    id: 11, name: "CDF_UINT1", size: 1,
    typedArray: Uint8Array,
    viewGet: DataView.prototype.getUint8,
    viewSet: DataView.prototype.setUint8
  },
  12: {
    id: 12, name: "CDF_UINT2", size: 2,
    typedArray: Uint16Array,
    viewGet: DataView.prototype.getUint16,
    viewSet: DataView.prototype.setUint16
  },
  14: {
    id: 14, name: "CDF_UINT4", size: 4,
    typedArray: Uint32Array,
    viewGet: DataView.prototype.getUint32,
    viewSet: DataView.prototype.setUint32
  },
  41: {
    id: 41, name: "CDF_BYTE", size: 1,
    typedArray: Int8Array,
    viewGet: DataView.prototype.getInt8,
    viewSet: DataView.prototype.setInt8
  },
  21: {
    id: 21, name: "CDF_REAL4", size: 4,
    typedArray: Float32Array,
    viewGet: DataView.prototype.getFloat32,
    viewSet: DataView.prototype.setFloat32
  },
  22: {
    id: 22, name: "CDF_REAL8", size: 8,
    typedArray: Float64Array,
    viewGet: DataView.prototype.getFloat64,
    viewSet: DataView.prototype.setFloat64
  },
  44: {
    id: 44, name: "CDF_FLOAT", size: 4,
    typedArray: Float32Array,
    viewGet: DataView.prototype.getFloat32,
    viewSet: DataView.prototype.setFloat32
  },
  45: {
    id: 45, name: "CDF_DOUBLE", size: 8,
    typedArray: Float64Array,
    viewGet: DataView.prototype.getFloat64,
    viewSet: DataView.prototype.setFloat64
  },
  31: {
    id: 31, name: "CDF_EPOCH", size: 8,
    typedArray: Float64Array,
    viewGet: DataView.prototype.getFloat64,
    viewSet: DataView.prototype.setFloat64
  },
  32: {
    id: 32, name: "CDF_EPOCH16", size: 16,
    typedArray: Float64Array,
    viewGet: DataView.prototype.getFloat64,
    viewSet: DataView.prototype.setFloat64
  },//not supported yet
  33: {
    id: 33, name: "CDF_TIME_TT2000", size: 8,
    typedArray: BigInt64Array,
    viewGet: DataView.prototype.getBigInt64,
    viewSet: DataView.prototype.setBigInt64
  },
  51: {
    id: 51, name: "CDF_CHAR", size: 1,
    typedArray: Uint8Array,
    viewGet: DataView.prototype.getUint8,
    viewSet: DataView.prototype.setUint8
  },
  52: {
    id: 52, name: "CDF_UCHAR", size: 1,
    typedArray: Uint8Array,
    viewGet: DataView.prototype.getUint8,
    viewSet: DataView.prototype.setUint8
  }
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
  this.addField("recordSize", CDF.DATA_TYPES.CDF_INT8, this.getSize);
  this.addField("recordType", CDF.DATA_TYPES.CDF_INT4, Record.TYPES[this.type]);
  
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
Record.prototype.unsetFlag = function(flg) {
  let flags = this.fields.get("Flags");
  if (!flags) {return false;}
  flags.value &= ~flg;
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

  this.addField("GDRoffset", CDF.DATA_TYPES.CDF_INT8, 312);
  this.addField("Version", CDF.DATA_TYPES.CDF_INT4, 3);
  this.addField("Release", CDF.DATA_TYPES.CDF_INT4, 7);
  this.addField("Flags", CDF.DATA_TYPES.CDF_INT4, 0b00011);
  this.addField("Encoding", CDF.DATA_TYPES.CDF_INT4, 6);
  this.addField("rfuA", CDF.DATA_TYPES.CDF_INT4, 0);
  this.addField("rfuB", CDF.DATA_TYPES.CDF_INT4, 0);
  this.addField("Increment", CDF.DATA_TYPES.CDF_INT4, 0);
  this.addField("Identifier", CDF.DATA_TYPES.CDF_INT4, 3);
  this.addField("rfuE", CDF.DATA_TYPES.CDF_INT4, -1);
  this.addField("Copyright", CDF.DATA_TYPES.CDF_CHAR, COPYRIGHT_TEXT, 256);
  
  if (cdf.skel.colMajority) {
    this.unsetFlag(CDF.FLAGS.ROW_MAJORITY);
  }

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

  this.addField("rVDRhead", CDF.DATA_TYPES.CDF_INT8, null);
  this.addField("zVDRhead", CDF.DATA_TYPES.CDF_INT8, null);
  this.addField("ADRhead", CDF.DATA_TYPES.CDF_INT8, null);
  this.addField("eof", CDF.DATA_TYPES.CDF_INT8, cdf.getTotalSize);
  this.addField("NrVars", CDF.DATA_TYPES.CDF_INT4,
    cdf.skel.zVars.length + cdf.skel.rVars.length
  );
  this.addField("NumAttr", CDF.DATA_TYPES.CDF_INT4, 
    cdf.attributes.g.size + cdf.attributes.r.size + cdf.attributes.z.size
  );
  this.addField("rMaxRec", CDF.DATA_TYPES.CDF_INT4, cdf.skel.rVars.length);
  this.addField("rNumDims", CDF.DATA_TYPES.CDF_INT4, cdf.skel.rDimSizes.length);
  this.addField("NzVars", CDF.DATA_TYPES.CDF_INT4, cdf.skel.zVars.length);
  this.addField("URIhead", CDF.DATA_TYPES.CDF_INT8, null);
  this.addField("rfuC", CDF.DATA_TYPES.CDF_INT4, 0);
  this.addField("LeapSecondLastUpdated", CDF.DATA_TYPES.CDF_INT4, 0);
  this.addField("rfuE", CDF.DATA_TYPES.CDF_INT4, -1);
  this.addField("rDimSizes", CDF.DATA_TYPES.CDF_INT4, cdf.skel.rDimSizes);
  
  return this;
}
GDR.prototype = Object.create(Record.prototype);
GDR.prototype.constructor = GDR;
GDR.prototype.getSize = function() {
 return 84 + this.fields("rNumDims").value;
};

function VDR() {
  this.addField("VDRnext", CDF.DATA_TYPES.CDF_INT8, null);
  this.addField("DataType", CDF.DATA_TYPES.CDF_INT4, null);
  this.addField("MaxRec", CDF.DATA_TYPES.CDF_INT4, -1);
  this.addField("VXRhead", CDF.DATA_TYPES.CDF_INT8, null);
  this.addField("VXRtail", CDF.DATA_TYPES.CDF_INT8, null);
  this.addField("Flags", CDF.DATA_TYPES.CDF_INT4, 0);
  this.addField("SRecrods", CDF.DATA_TYPES.CDF_INT4, null);
  this.addField("rfuB", CDF.DATA_TYPES.CDF_INT4, 0);
  this.addField("rfuC", CDF.DATA_TYPES.CDF_INT4, -1);
  this.addField("rfuF", CDF.DATA_TYPES.CDF_INT4, -1);
  this.addField("NumElems", CDF.DATA_TYPES.CDF_INT4, 1);
  this.addField("Num", CDF.DATA_TYPES.CDF_INT4, 1);
  this.addField("CPRorSPRoffset", CDF.DATA_TYPES.CDF_INT8, null);
  this.addField("BlockingFactor", CDF.DATA_TYPES.CDF_INT4, null);
  this.addField("Name", CDF.DATA_TYPES.CDF_CHAR, "", 256);
  if (this.type == "ZVDR") {
    this.addField("zNumDims", CDF.DATA_TYPES.CDF_INT4, null);
    this.addField("zDimSizes", CDF.DATA_TYPES.CDF_INT4, null);  
  }
  this.addField("DimVarys", CDF.DATA_TYPES.CDF_INT4, 0);
  
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

  this.addField("ADRnext", CDF.DATA_TYPES.CDF_INT8, null);
  this.addField("AgrEDRhead", CDF.DATA_TYPES.CDF_INT8, null);
  this.addField("Scope", CDF.DATA_TYPES.CDF_INT4, 1);
  this.addField("Num", CDF.DATA_TYPES.CDF_INT4, 0);
  this.addField("NgrEntries", CDF.DATA_TYPES.CDF_INT4, 0);
  this.addField("MAXgrEntry", CDF.DATA_TYPES.CDF_INT4, 0);
  this.addField("rfuA", CDF.DATA_TYPES.CDF_INT4, 0);
  this.addField("AzEDRhead", CDF.DATA_TYPES.CDF_INT8, null);
  this.addField("NzEntries", CDF.DATA_TYPES.CDF_INT4, 0);
  this.addField("MAXzEntry", CDF.DATA_TYPES.CDF_INT4, 0);
  this.addField("rfuE", CDF.DATA_TYPES.CDF_INT4, -1);
  this.addField("Name", CDF.DATA_TYPES.CDF_CHAR, "", 256);
  
  return this;
}
ADR.prototype = Object.create(Record.prototype);
ADR.prototype.constructor = ADR;
ADR.prototype.getSize = function() {return 324;}

function AEDR(dt, val) {
  if (!val.length) {val = [val]}

  this.addField("AEDRnext", CDF.DATA_TYPES.CDF_INT8, null);
  this.addField("AttrNum", CDF.DATA_TYPES.CDF_INT4, 0);
  this.addField("DataType", CDF.DATA_TYPES.CDF_INT4, CDF.DATA_TYPES[dt].id);
  this.addField("Num", CDF.DATA_TYPES.CDF_INT4, 0);
  this.addField("NumElems", CDF.DATA_TYPES.CDF_INT4, val.length);
  this.addField("NumStrings", CDF.DATA_TYPES.CDF_INT4,
    typeof val === "string"? split("\\n").length : 1
  );
  this.addField("rfuB", CDF.DATA_TYPES.CDF_INT4, 0);
  this.addField("rfuC", CDF.DATA_TYPES.CDF_INT4, 0);
  this.addField("rfuD", CDF.DATA_TYPES.CDF_INT4, -1);
  this.addField("rfuE", CDF.DATA_TYPES.CDF_INT4, -1);
  this.addField("Value", CDF.DATA_TYPES[dt], val);
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
  
  this.addField("VXRnext", CDF.DATA_TYPES.CDF_INT8, 0);
  this.addField("Nentries", CDF.DATA_TYPES.CDF_INT4, VXR.N_ENTRIES);
  this.addField("NusedEntries", CDF.DATA_TYPES.CDF_INT4, 0);
  this.addField("First", CDF.DATA_TYPES.CDF_INT4,
    (new Array(VXR.N_ENTRIES)).fill(0xFFFFFFFF), VXR.N_ENTRIES
  );
  this.addField("Last", CDF.DATA_TYPES.CDF_INT4,
    (new Array(VXR.N_ENTRIES)).fill(0xFFFFFFFF), VXR.N_ENTRIES
  );
  this.addField("Offset", CDF.DATA_TYPES.CDF_INT8,
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