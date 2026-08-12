const eighthFractions: Record<number, string> = {
  0: '',
  1: '⅛',
  2: '¼',
  3: '⅜',
  4: '½',
  5: '⅝',
  6: '¾',
  7: '⅞',
}

export const formatHeightMeasurement = (height: number | null | undefined): string => {
  if (height == null || height <= 0) return '—'

  if (Number.isInteger(height) && height >= 1000 && height <= 9999) {
    const encoded = Math.trunc(height).toString().padStart(4, '0')
    const feet = Number(encoded.slice(0, 1))
    const inches = Number(encoded.slice(1, 3))
    const eighths = Number(encoded.slice(3, 4))
    if (feet >= 4 && feet <= 7 && inches >= 0 && inches < 12 && eighths >= 0 && eighths < 8) {
      return `${feet}' ${inches}${eighthFractions[eighths]}\"`
    }
  }

  const feet = Math.floor(height / 12)
  const inches = height - (feet * 12)
  const formattedInches = Number.isInteger(inches)
    ? inches.toString()
    : inches.toFixed(2).replace(/0+$/, '').replace(/\.$/, '')
  return `${feet}' ${formattedInches}\"`
}

export const formatScoutingInches = (value: number | null | undefined): string => {
  if (value == null || value <= 0) return '—'

  if (Number.isInteger(value) && value >= 100) {
    const encoded = Math.trunc(value).toString()
    const wholeInches = Number(encoded.slice(0, -2))
    const eighths = Number(encoded.slice(-2, -1))
    const denominator = Number(encoded.slice(-1))
    if (wholeInches > 0 && denominator === 8 && eighths >= 0 && eighths < 8) {
      return `${wholeInches}${eighthFractions[eighths]}\"`
    }
  }

  return `${value}\"`
}

export const formatTimeMeasurement = (value: number | null | undefined): string =>
  value == null ? '—' : `${value.toFixed(2)}s`

export const formatDistanceMeasurement = (value: number | null | undefined): string =>
  value == null ? '—' : `${Number.isInteger(value) ? value : value.toFixed(1)}\"`

export const formatWeightMeasurement = (value: number | null | undefined): string =>
  value == null ? '—' : `${Number.isInteger(value) ? value : value.toFixed(1)} lbs`
