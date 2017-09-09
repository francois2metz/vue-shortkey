let ShortKey = {}
let mapFunctions = {}
let objAvoided = []
let elementAvoided = []
let keyPressed = false
let nbBinds = 0

function isTrue(property) {
  return property === true;
}

function bindingValueToKey(binding) {
  return (typeof binding.value === 'string' ? JSON.parse(binding.value.replace(/\'/gi, '"')) : binding.value).join('')
}

function eventKeydown(pKey) {
  const decodedKey = ShortKey.decodeKey(pKey)

  // Check evict
  if (filteringElement(pKey)) {
    pKey.preventDefault()
    pKey.stopPropagation()
    if (mapFunctions[decodedKey].fn) {
      ShortKey.keyDown(decodedKey)
      keyPressed = true
    } else if (!keyPressed) {
      mapFunctions[decodedKey].el.focus()
      keyPressed = true
    }
  }
}

function eventKeyup(pKey) {
  const decodedKey = ShortKey.decodeKey(pKey)
  if (filteringElement(pKey)) {
    pKey.preventDefault()
    pKey.stopPropagation()
    if (mapFunctions[decodedKey].oc || mapFunctions[decodedKey].ps) {
      ShortKey.keyUp(decodedKey)
    }
  }
  keyPressed = false
}

ShortKey.directive = {
  bind: (el, binding, vnode) => {
    if (isTrue(binding.modifiers.avoid)) {
      objAvoided.push(el)
    } else {
      mapFunctions[bindingValueToKey(binding)] = {
        'ps': isTrue(binding.modifiers.push),
        'oc': isTrue(binding.modifiers.once),
        'fn': !isTrue(binding.modifiers.focus),
        'el': vnode.elm
      }
      nbBinds += 1
      if (nbBinds == 1) {
        document.addEventListener('keydown', eventKeydown, true)
        document.addEventListener('keyup', eventKeyup, true)
      }
    }
  },
  unbind: (el, binding) => {
    if (isTrue(binding.modifiers.avoid)) {
      objAvoided = objAvoided.filter((itm) => {
        return !itm === el;
      })
    } else {
      let k = bindingValueToKey(binding)
      if (mapFunctions[k].el === el) {
        delete mapFunctions[k]
        nbBinds -= 1
        if (nbBinds == 0) {
          document.removeEventListener('keydown', eventKeydown)
          document.removeEventListener('keyup', eventKeyup)
        }
      }
    }
  }
}

ShortKey.install = (Vue, options) => {
  elementAvoided = [...(options && options.prevent ? options.prevent : [])]
  Vue.directive('shortkey', ShortKey.directive)
}

ShortKey.decodeKey = (pKey) => {
  let k = ''
  if (pKey.key === 'Shift' || pKey.shiftKey) { k += 'shift' }
  if (pKey.key === 'Control' || pKey.ctrlKey) { k += 'ctrl' }
  if (pKey.key === 'Meta'|| pKey.metaKey) { k += 'meta' }
  if (pKey.key === 'Alt' || pKey.altKey) { k += 'alt' }
  if (pKey.key === 'ArrowUp') { k += 'arrowup' }
  if (pKey.key === 'ArrowLeft') { k += 'arrowleft' }
  if (pKey.key === 'ArrowRight') { k += 'arrowright' }
  if (pKey.key === 'ArrowDown') { k += 'arrowdown' }
  if (pKey.key === 'AltGraph') { k += 'altgraph' }
  if (pKey.key === 'Escape') { k += 'esc' }
  if (pKey.key === 'Enter') { k += 'enter' }
  if (pKey.key === 'Tab') { k += 'tab' }
  if (pKey.key === ' ') { k += 'space' }
  if (pKey.key === 'PageUp') { k += 'pageup' }
  if (pKey.key === 'PageDown') { k += 'pagedown' }
  if (pKey.key === 'Home') { k += 'home' }
  if (pKey.key === 'End') { k += 'end' }
  if ((pKey.key && pKey.key !== ' ' && pKey.key.length === 1) || /F\d{1,2}/g.test(pKey.key)) k += pKey.key.toLowerCase()
  return k
}

ShortKey.keyDown = (pKey) => {
  if ((!mapFunctions[pKey].oc && !mapFunctions[pKey].ps)|| (mapFunctions[pKey].ps && !keyPressed)) {
    const e = document.createEvent('HTMLEvents')
    e.initEvent('shortkey', true, true)
    mapFunctions[pKey].el.dispatchEvent(e)
  }
}
ShortKey.keyUp = (pKey) => {
  const e = document.createEvent('HTMLEvents')
  e.initEvent('shortkey', true, true)
  mapFunctions[pKey].el.dispatchEvent(e)
}

const filteringElement = (pKey) => {
  const decodedKey = ShortKey.decodeKey(pKey)
  const objectAvoid = objAvoided.find(r => r === document.activeElement)
  const elementSeparate = checkElementType()
  const elementTypeAvoid = elementSeparate.avoidedTypes
  const elementClassAvoid = elementSeparate.avoidedClasses
  const filterTypeAvoid = elementTypeAvoid.find(r => r === document.activeElement.tagName.toLowerCase())
  const filterClassAvoid = elementClassAvoid.find(r => r === '.' + document.activeElement.className.toLowerCase())
  return !objectAvoid && mapFunctions[decodedKey] && !filterTypeAvoid && !filterClassAvoid
}

const checkElementType = () => {
  let elmTypeAvoid = []
  let elmClassAvoid = []
  elementAvoided.forEach(r => {
    const dotPosition = r.indexOf('.')
    if (dotPosition === 0) {
      elmClassAvoid.push(r)
    } else if (dotPosition > 0) {
      elmTypeAvoid.push(r.split('.')[0])
      elmClassAvoid.push('.' + r.split('.')[1])
    } else {
      elmTypeAvoid.push(r)
    }
  })

  return {avoidedTypes: elmTypeAvoid, avoidedClasses: elmClassAvoid}
}

// export default ShortKey

if (typeof module != 'undefined' && module.exports) {
  module.exports = ShortKey;
} else if (typeof define == 'function' && define.amd) {
  define( function () { return ShortKey; } );
} else {
  window.ShortKey = ShortKey;
}
