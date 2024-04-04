export const DISP_FORMULA = () => `
  <disp-formula><tex-math></tex-math></disp-formula>
`

export const DISP_QUOTE = () => `
  <disp-quote></disp-quote>
`

export const FIGURE_SNIPPET = () => `
  <fig xmlns:xlink="http://www.w3.org/1999/xlink">
    <caption></caption>
    <graphic mime-subtype="" mimetype="image" xlink:href="" />
  </fig>
`

export const FOOTNOTE_SNIPPET = () => `
  <fn></fn>
`

export const PERSON_SNIPPET = () => `
  <contrib contrib-type="person" equal-contrib="no" corresp="no" deceased="no">
    <name>
      <surname></surname>
      <given-names></given-names>
      <suffix></suffix>
    </name>
    <bio></bio>
  </contrib>
`

export const SUPPLEMENTARY_FILE = () => `
  <supplementary-material xmlns:xlink="http://www.w3.org/1999/xlink" mimetype="" mime-sub-type="" xlink:href="">
    <caption></caption>
  </supplementary-material>
`

export const TABLE_SNIPPET = (nrows, ncols) => `
  <table-wrap>
    <caption>
    </caption>
    <table>
      <tbody>
        <tr>
          ${Array(ncols).fill().map(() => '<th></th>').join('')}
        </tr>
        ${Array(nrows).fill().map(() => `<tr>
          ${Array(ncols).fill().map(() => '<td></td>').join('')}
        </tr>`).join('')}
      </tbody>
    </table>
  </table-wrap>
`
