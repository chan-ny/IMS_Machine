exports.getTime = () => {
  const unixTime = Math.round((new Date()).getTime() / 1000)

  const date = new Date(unixTime * 1000)
  const year = date.getFullYear()
  const month = `0${date.getMonth() + 1}`.substr(-2)
  const day = `0${date.getDate()}`.substr(-2)
  const hour = `0${date.getHours()}`.substr(-2)
  const minute = `0${date.getMinutes()}`.substr(-2)
  const second = `0${date.getSeconds()}`.substr(-2)

  return `${year}-${month}-${day}.${hour}-${minute}-${second}`
}
