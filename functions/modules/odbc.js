const getAcceptNo = async (connection, date, licenseNo) => {
  return await connection.query(`SELECT TOP 1 * FROM TableCarInfo WHERE AcceptNo LIKE \'%${date}%\' AND Car___No LIKE \'%${licenseNo}\' ORDER BY AcceptNo DESC`)
    .then(async carInfo => {
      if (carInfo.length > 0) {
        return carInfo[0].AcceptNo
      } else {
        throw 'Can not find AcceptNo'
      }
    })
    .catch(err => {
      console.log(err)
      throw err
    })
}

const getSuspensionSystemData = async (connection, acceptNo) => {
  return await connection.query(`SELECT * FROM TableCarData WHERE AcceptNo = \'${acceptNo}\'`)
    .then(carData => {
      if (carData.length > 0) {
        return carData[0]
      } else {
        return null
      }
    })
    .catch(err => {
      console.log(err)
      throw err
    })
}

const getLightData = async (connection, acceptNo) => {
  return await connection.query(`SELECT * FROM TableCar_HLT WHERE AcceptNo = \'${acceptNo}\'`)
    .then(lightData => {
      if (lightData.length > 0) {
        return lightData[0]
      } else {
        return null
      }
    })
    .catch(err => {
      console.log(err)
      throw err
    })
}

const getOpacityData = async (connection, acceptNo) => {
  return await connection.query(`SELECT * FROM TableCar_Opa WHERE AcceptNo = \'${acceptNo}\'`)
    .then(opacityData => {
      if (opacityData.length > 0) {
        return opacityData[0]
      } else {
        return null
      }
    })
    .catch(err => {
      console.log(err)
      throw err
    })
}

const getCoHcData = async (connection, acceptNo) => {
  return await connection.query(`SELECT * FROM TableCarCOHC WHERE AcceptNo = \'${acceptNo}\'`)
    .then(coHcData => {
      if (coHcData.length > 0) {
        return coHcData[0]
      } else {
        return null
      }
    })
    .catch(err => {
      console.log(err)
      throw err
    })
}

const getSideSlip = (value, position) => {
  if (value === '0' || value === '') {
    return ''
  } else {
    if (position === 'IN') {
      return Number(value) * -1
    } else {
      return Number(value)
    }
  }
}

const getSpeedDiff = (value, speedCheck) => {
  const diff = Math.abs(speedCheck - value)
  const percent = (diff * 100) / speedCheck
  return percent
}

exports.getData = async (connection, date, licenseNo) => {
  const acceptNo = await getAcceptNo(connection, date, licenseNo)
  const suspensionSystem = await getSuspensionSystemData(connection, acceptNo)
  const lightSystem = await getLightData(connection, acceptNo)
  const opacitySystem = await getOpacityData(connection, acceptNo)
  const mufflerSystem = await getCoHcData(connection, acceptNo)
  let value = {
    opacity: '',
    co: '',
    hc: '',
    db: '',
    light: {
      low: { // ไฟต่ำ
        left: { angle: '', tilte: '', brightness: '' }, // มุม, เอียง, ความสะหว่าง 
        right: { angle: '', tilte: '', brightness: '' } // มุม, เอียง, ความสะหว่าง 
      },
      high: { // ไฟสูง
        left: { angle: '', tilte: '', brightness: '' }, // มุม, เอียง, ความสะหว่าง 
        right: { angle: '', tilte: '', brightness: '' } // มุม, เอียง, ความสะหว่าง 
      }
    },
    sideSlip: '', // ศูนย์ล้อ
    brake: {
      sum: '', // ประสิทธิภาพรวมของเบรค
      shaft1: { left: '', right: '', diff: '' }, // เพลา 1 -- แรงเบรคล้อซ่าย, แรงเบรคล้อขวา, ผลต่าง
      shaft2: { left: '', right: '', diff: '' }, // เพลา 2 -- แรงเบรคล้อซ่าย, แรงเบรคล้อขวา, ผลต่าง
      shaft3: { left: '', right: '', diff: '' }, // เพลา 3 -- แรงเบรคล้อซ่าย, แรงเบรคล้อขวา, ผลต่าง
      shaft4: { left: '', right: '', diff: '' } // เพลา 4 -- แรงเบรคล้อซ่าย, แรงเบรคล้อขวา, ผลต่าง
    },
    handBrake: '',
    emergencyBrake: '',
    speed: { // ความเร็ว
      speed20: { result: '', diff: '' }, // ความเร็ว20 -- ผลลัพธ์, ผลต่าง
      speed40: { result: '', diff: '' }, // ความเร็ว40 -- ผลลัพธ์, ผลต่าง
      speed60: { result: '', diff: '' } // ความเร็ว60 -- ผลลัพธ์, ผลต่าง
    },
    relax: { // ผ่อนคลาย
      shaft1: '', // เพลา 1
      shaft2: '' // เพลา 2
    },
    weight: {
      sum: '', // น้ำหนักลงเพลาทั้งหมด
      shaft1: '', // น้ำหนักลงเพลา 1
      shaft2: '', // น้ำหนักลงเพลา 2
      shaft3: '', // น้ำหนักลงเพลา 3
      shaft4: '' // น้ำหนักลงเพลา 4
    }
  }
  if (suspensionSystem) {
    value.sideSlip = await getSideSlip(suspensionSystem.SlipV_FF, suspensionSystem.SlipIOFF)
    value.brake.sum = Number(suspensionSystem.BSumP_PK)
    // value.brake.sum = 49
    // -----------------------------------------------
    value.brake.shaft1.left = Number(suspensionSystem.Brk_L_FF)
    value.brake.shaft1.right = Number(suspensionSystem.Brk_R_FF)
    value.brake.shaft1.diff = Number(suspensionSystem.BDiff_FF)
    // -----------------------------------------------
    value.brake.shaft2.left = Number(suspensionSystem.Brk_L_RR)
    value.brake.shaft2.right = Number(suspensionSystem.Brk_R_RR)
    value.brake.shaft2.diff = Number(suspensionSystem.BDiff_RR)
    // -----------------------------------------------
    value.weight.sum = Number(suspensionSystem.Axis_SUM)
    value.weight.shaft1 = Number(suspensionSystem.Axis__FF)
    value.weight.shaft2 = Number(suspensionSystem.Axis__RR)
    value.weight.shaft3 = 0
    value.weight.shaft4 = 0
    // -----------------------------------------------
    value.handBrake = suspensionSystem.BSumPBPK ? Number(suspensionSystem.BSum__PB) : ''
    // -----------------------------------------------
    value.speed.speed40.result = suspensionSystem.Speed_PK ? Number(suspensionSystem.Speed_40) : ''
    value.speed.speed40.diff = value.speed.speed40.result ? await getSpeedDiff(value.speed.speed40.result, 40) : ''
    // -----------------------------------------------
  }
  if (lightSystem) {
    // get light data
  }
  if (opacitySystem) {
    value.opacity = opacitySystem.Opacity_PK ? Number(opacitySystem.OpaAverage) : ''
  }
  if (mufflerSystem) {
    value.co = Math.max(Number(mufflerSystem.TstL__CO), Number(mufflerSystem.TstH__CO))
    value.hc = Math.max(Number(mufflerSystem.TstL__HC), Number(mufflerSystem.TstH__HC))
  }
  // await closeOdbc(connection)
  return value
}

async function closeOdbc (connection) {
  await connection.close()
    .then(_ => {
      console.log('ODBC is disconnected.')
    })
    .catch(err => {
      console.log(err)
    })
}