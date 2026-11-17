import { describe, expect, it } from 'vitest'
import { commonDeparture, dayFirst, findColumns, guessDeparture, needsLook, parseCsv, readSheet, sheetCsvUrl, toTime } from './sheetImport'

// Same shape and the same mistakes as a real Google Forms response sheet (names changed).
const csv = `Timestamp,Email Address,Name,Can you attend?,Give a good enough reason for not attending? :/,Number of guests attending?,Arrival Date,Arrival Time,Departure Date,Departure Time
11/4/2026 14:53:41,a@x.in,Asha,"Yes, I'll be there",,2,12/2/2026,2:00:00 PM,,
11/4/2026 16:24:16,b@x.in,Bina,"Yes, I'll be there",,1,12/4/2026,9:00:00 AM,12/6/2026,9:35:00 AM
11/5/2026 15:05:53,c@x.in,Chirag,"Yes, I'll be there",,1,12/4/2026,10:00:00 AM,11/6/2026,
11/6/2026 17:53:03,d@x.in,Dev Shah and Diya Rao,"Yes, I'll be there",,2,12/2/2026,2:30:00 PM,12/6/2026,4:30:00 AM
11/7/2026 6:42:19,e@x.in,Esha,Why this koala-veri di?,"Sorry, I can't, I'm getting married too",1,12/4/2026,8:00:00 AM,,
11/11/2026 11:51:13,f@x.in,Farhan,"Yes, I'll be there",,1,12/1/0026,10:00:00 AM,12/5/0026,11:00:00 PM
`

describe('readSheet', () => {
  const { rows, error } = readSheet(csv)
  const by = (n: string) => rows.find((r) => r.name.startsWith(n))!

  it('finds the columns of a Google Forms sheet', () => {
    expect(error).toBeUndefined()
    expect(findColumns(parseCsv(csv)[0])).toEqual({ email: 1, name: 2, coming: 3, note: 4, count: 5, arrival: 6, arrivalTime: 7, departure: 8, departureTime: 9 })
    expect(rows).toHaveLength(6)
  })

  it('reads dates, times and counts', () => {
    expect(by('Bina')).toMatchObject({ coming: 'YES', count: 1, arrival: '2026-12-04', arrivalTime: '09:00', departure: '2026-12-06', departureTime: '09:35' })
    expect(by('Asha').arrivalTime).toBe('14:00')
  })

  it('treats any non-yes answer as not coming, and keeps the reason', () => {
    expect(by('Esha')).toMatchObject({ coming: 'NO', note: "Sorry, I can't, I'm getting married too", missingDeparture: false })
  })

  it('fixes a 0026 year on its own and says so', () => {
    expect(by('Farhan')).toMatchObject({ arrival: '2026-12-01', departure: '2026-12-05' })
    expect(by('Farhan').fixed[0]).toMatch(/0026.*2026/)
  })

  it('flags a missing departure and a departure before arrival', () => {
    expect(by('Asha').missingDeparture).toBe(true)
    expect(by('Chirag').departureBeforeArrival).toBe(true)
    expect(guessDeparture('2026-12-04', '2026-11-06')).toBe('2026-12-06')
    expect(rows.filter(needsLook).map((r) => r.name)).toEqual(['Asha', 'Chirag'])
    expect(commonDeparture(rows)).toBe('2026-12-06')
  })

  it('splits two names in one row', () => {
    expect(by('Dev').count).toBe(2)
    expect(by('Dev').fixed[0]).toMatch(/2 names/)
  })

  it('reads day-first sheets (India locale)', () => {
    expect(dayFirst(['04/12/2026', '17/11/2026 10:00'])).toBe(true)
    expect(readSheet('Name,Arrival date,Departure date\nRavi,4/12/2026,16/12/2026').rows[0]).toMatchObject({ arrival: '2026-12-04', departure: '2026-12-16' })
  })

  it('explains a file without a name column', () => {
    expect(readSheet('a,b\n1,2').error).toMatch(/Name/)
  })
})

describe('helpers', () => {
  it('times', () => {
    expect(toTime('12:30:00 AM')).toBe('00:30')
    expect(toTime('11:00:00 PM')).toBe('23:00')
    expect(toTime('14:05')).toBe('14:05')
    expect(toTime('soon')).toBeUndefined()
  })
  it('sheet links', () => {
    expect(sheetCsvUrl('https://docs.google.com/spreadsheets/d/1AbCdEfGhIjKlMnOpQrStUvWxYz0123456789/edit#gid=42')).toBe('https://docs.google.com/spreadsheets/d/1AbCdEfGhIjKlMnOpQrStUvWxYz0123456789/gviz/tq?tqx=out:csv&gid=42')
    expect(sheetCsvUrl('https://example.com')).toBeUndefined()
  })
})
