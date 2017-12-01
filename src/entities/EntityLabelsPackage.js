export default {
  name: 'entity-labels',
  configure(config) {
    config.addLabel('book', 'Book')
    config.addLabel('journal-article', 'Journal Article')

    // book labels
    config.addLabel('authors', 'Authors')
    config.addLabel('editors', 'Editors')
    config.addLabel('chapterTitle', 'Chapter Title')
    config.addLabel('articleTitle', 'Article Title')
    config.addLabel('source', 'Source')
    config.addLabel('edition', 'Edition')
    config.addLabel('publisherLoc', 'Publisher Location')
    config.addLabel('publisherName', 'Publisher Name')
    config.addLabel('year', 'Year')
    config.addLabel('month', 'Month')
    config.addLabel('day', 'Day')
    config.addLabel('fpage', 'First Page')
    config.addLabel('lpage', 'Last Page')
    config.addLabel('pageRange', 'Page Range')
    config.addLabel('elocationId', 'E-Location ID')
    config.addLabel('doi', 'DOI')
    config.addLabel('isbn', 'ISBN')
    config.addLabel('pmid', 'PubMed ID')

    config.addLabel('conference-proceeding', 'Conference Proceeding')
    config.addLabel('create-conference-proceeding', 'Create Conference Proceeding')
    config.addLabel('confName', 'Conference Name')

    config.addLabel('clinical-trial', 'Clinical Trial')
    config.addLabel('create-clinical-trial', 'Create Clinical Trial')

    config.addLabel('preprint', 'Preprint')
    config.addLabel('create-preprint', 'Create Preprint')

    config.addLabel('report', 'Report')
    config.addLabel('create-report', 'Create Report')

    // person labels
    config.addLabel('person', 'Person')
    config.addLabel('orcid', 'ORCID')
    config.addLabel('givenNames', 'Given names')
    config.addLabel('surname', 'Surname')
    config.addLabel('prefix', 'Prefix')
    config.addLabel('suffix', 'Suffix')
    config.addLabel('affiliations', 'Affiliations')
    // organisation labels
    config.addLabel('organisation', 'Organisation')
    config.addLabel('name', 'Name')
    config.addLabel('division1', 'Division 1 (Department)')
    config.addLabel('division2', 'Division 2')
    config.addLabel('division3', 'Division 2')
    config.addLabel('street', 'Address Line 1 (Street)')
    config.addLabel('addressComplements', 'Address Line 2 (Complements)')
    config.addLabel('city', 'City')
    config.addLabel('state', 'State')
    config.addLabel('postalCode', 'Postal Code')
    config.addLabel('country', 'Country')
    config.addLabel('phone', 'Phone')
    config.addLabel('fax', 'Fax')
    config.addLabel('email', 'Email')
    config.addLabel('uri', 'Website')

    config.addLabel('edit-book', 'Edit Book')
    config.addLabel('add-book', 'Add Book')
    config.addLabel('edit-journal-article', 'Edit Journal Article')
    config.addLabel('add-journal-article', 'Add Journal Article')
    config.addLabel('add-person', 'Add Person')
    config.addLabel('edit-person', 'Edit Person')
    config.addLabel('add-organisation', 'Add Organisation')
    config.addLabel('edit-organisation', 'Edit Organisation')

    config.addLabel('edit-authors', 'Edit Authors')
    config.addLabel('edit-editors', 'Edit Editors')
    config.addLabel('edit-references', 'Edit References')
    config.addLabel('edit-affiliations', 'Edit Affiliations')

    config.addLabel('create-book', 'Create Book')
    config.addLabel('create-journal-article', 'Create Journal Article')
    config.addLabel('create-person', 'Create Person')
    config.addLabel('create-organisation', 'Create Organisation')
  }
}