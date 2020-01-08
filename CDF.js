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

function Record(t) {
  if (!Record.TYPES[t]) {
    return null;
  }

  let fields = FieldCollections[t]();

  Object.defineProperties(this, {
    type: {
      get: () => Record.TYPES[t]
    },
    fields: {
      get: () => fields
    }
  });

  return this;
} 

FieldCollections = {
  CDR: function() {
    return [
      ["GDRoffset", "s8", 0],
      ["Version", "s4", 0],
      ["Release", "s4", 0],
      ["Encoding", "s4", 0],
      ["Flags", "s4", 0],
      ["rfuA", "s4", 0],
      ["rfuB", "s4", 0],
      ["Increment", "s4", 0],
      ["Identifier", "s4", 3],
      ["rfuE", "s4", -1],
      ["Copyright", "ascii", [""], 256]
    ]
  },
  GDR: function() {
    return [
      ["rVDRhead", "s8", 0],
      ["zVDRhead", "s8", 0],
      ["ADRhead", "s8", 0],
      ["eof", "s8", 0],
      ["NrVars", "s4", 0],
      ["NumAttr", "s4", 0],
      ["rMaxRec", "s4", 0],
      ["rNumDims", "s4", 0],
      ["NzVars", "s4", 0],
      ["UIRhead", "s8", 0],
      ["rfuC", "s4", 0],
      ["LeapSecondLastUpdated", "s4", 0],
      ["rfuE", "s4", 0],
      ["rDimSizes", "s4", [], 0]
    ];
  },
  RVDR: function() {
    return this;
  },
  ADR: function() {
    return this;
  },
  AGR_EDR: function() {
    return this;
  },
  VXR: function() {
    return this;
  },
  VVR: function() {
    return this;
  },
  ZVDR: function() {
    return this;
  },
  AZ_EDR: function() {
    return this;
  },
  CCR: function() {
    return this;
  },
  CPR: function() {
    return this;
  },
  SPR: function() {
    return this;
  },
  CVVR: function() {
    return this;
  },
  URI: function() {
    return this;
  }
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