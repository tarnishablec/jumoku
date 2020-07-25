import { html } from '@gallop/gallop'

export const CodeSandboxIcon = ({
  active = false,
  onClick
}: { active?: boolean; onClick?: () => unknown } = {}) => html`
  <svg
    @click="${onClick}"
    t="1595692530090"
    class="icon"
    viewBox="0 0 1024 1024"
    version="1.1"
    xmlns="http://www.w3.org/2000/svg"
    p-id="37803"
    .class="${active ? 'active' : ''}"
  >
    <path
      d="M709.6 210l0.4-0.2h0.2L512 96 313.9 209.8h-0.2l0.7 0.3L151.5 304v416L512 928l360.5-208V304l-162.9-94zM482.7 843.6L339.6 761V621.4L210 547.8V372.9l272.7 157.3v313.4zM238.2 321.5l134.7-77.8 138.9 79.7 139.1-79.9 135.2 78-273.9 158-274-158zM814 548.3l-128.8 73.1v139.1l-143.9 83V530.4L814 373.1v175.2z"
      p-id="37804"
    ></path>
  </svg>
`
