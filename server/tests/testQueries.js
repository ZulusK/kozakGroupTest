const httpStatus = require('http-status');

const testSuitsForUserPassword = {
  password: [
    {
      data: {
        password: null
      },
      expectedCode: httpStatus.BAD_REQUEST,
      description: 'empty'
    },
    {
      data: {
        password: 'a2!34'
      },
      expectedCode: httpStatus.BAD_REQUEST,
      description: '< 8 symbols'
    },
    {
      data: {
        password: 'a234asakIHIBS!Ibi2i7iaih87xaixjnsscscscscsci'
      },
      expectedCode: httpStatus.BAD_REQUEST,
      description: '> 20 symbols'
    },
    {
      data: {
        password: 'ADLassd23'
      },
      expectedCode: httpStatus.BAD_REQUEST,
      description: 'without special symbols'
    },
    {
      data: {
        password: 'ADLNLWNOWN23!'
      },
      expectedCode: httpStatus.BAD_REQUEST,
      description: 'without lowercase symbols'
    },
    {
      data: {
        password: 'asfsisib2b@k23k2k'
      },
      expectedCode: httpStatus.BAD_REQUEST,
      description: 'without uppercase symbols'
    }
  ]
};
const testSuitsForUser = {
  username: [
    {
      data: {
        username: null
      },
      expectedCode: httpStatus.BAD_REQUEST,
      description: 'empty'
    },
    {
      data: {
        username: 'n'
      },
      expectedCode: httpStatus.BAD_REQUEST,
      description: '< 2 symbols'
    },
    {
      data: {
        username: 'naaaaaaaaaaaaaaanaaaaaaaaaaaaaaa'
      },
      expectedCode: httpStatus.BAD_REQUEST,
      description: '> 20 symbols'
    }
  ],
  email: [
    {
      data: {
        email: 'invalid1'
      },
      expectedCode: httpStatus.BAD_REQUEST,
      description: 'not a email'
    },
    {
      data: {
        email: null
      },
      expectedCode: httpStatus.BAD_REQUEST,
      description: 'empty'
    }
  ],
  password: [
    {
      data: {
        password: null
      },
      expectedCode: httpStatus.BAD_REQUEST,
      description: 'empty'
    },
    {
      data: {
        password: 'a2!34'
      },
      expectedCode: httpStatus.BAD_REQUEST,
      description: '< 8 symbols'
    },
    {
      data: {
        password: 'a234asakIHIBS!Ibi2i7iaih87xaixjni'
      },
      expectedCode: httpStatus.BAD_REQUEST,
      description: '> 20 symbols'
    },
    {
      data: {
        password: 'ADLassd23'
      },
      expectedCode: httpStatus.BAD_REQUEST,
      description: 'without special symbols'
    },
    {
      data: {
        password: 'ADLNLWNOWN23!'
      },
      expectedCode: httpStatus.BAD_REQUEST,
      description: 'without lowercase symbols'
    },
    {
      data: {
        password: 'asfsisib2b@k23k2k'
      },
      expectedCode: httpStatus.BAD_REQUEST,
      description: 'without uppercase symbols'
    }
  ]
};
const testSuitsForWorker = {
  'contacts.mobileNumber': [
    {
      data: {
        contacts: { mobileNumber: null }
      },
      expectedCode: httpStatus.BAD_REQUEST,
      description: 'empty'
    },
    {
      data: {
        contacts: { mobileNumber: '+380500719822' }
      },
      expectedCode: httpStatus.OK,
      description: 'valid'
    },
    {
      data: {
        contacts: { mobileNumber: '0500719822' }
      },
      expectedCode: httpStatus.BAD_REQUEST,
      description: 'no country code'
    },
    {
      data: {
        contacts: { mobileNumber: '+38050907198262' }
      },
      expectedCode: httpStatus.BAD_REQUEST,
      description: 'too match digits'
    },
    {
      data: {
        contacts: { mobileNumber: '+38050071986' }
      },
      expectedCode: httpStatus.BAD_REQUEST,
      description: 'too little digits'
    }
  ],
  gender: [
    {
      data: {
        gender: null
      },
      expectedCode: httpStatus.BAD_REQUEST,
      description: 'empty'
    },
    {
      data: {
        gender: 'dog'
      },
      expectedCode: httpStatus.BAD_REQUEST,
      description: 'use "dog"'
    },
    {
      data: {
        gender: 'female'
      },
      expectedCode: httpStatus.OK,
      description: 'use "female"'
    },
    {
      data: {
        gender: 'male'
      },
      expectedCode: httpStatus.OK,
      description: 'use "male"'
    }
  ],
  fullname: [
    {
      data: {
        fullname: null
      },
      expectedCode: httpStatus.BAD_REQUEST,
      description: 'empty'
    },
    {
      data: {
        fullname: '123456 some other user'
      },
      expectedCode: httpStatus.BAD_REQUEST,
      description: 'use digits'
    },
    {
      data: {
        fullname: '          '
      },
      expectedCode: httpStatus.BAD_REQUEST,
      description: 'use only spaces'
    },
    {
      data: {
        fullname: Array.from({ length: 40 }).join('')
      },
      expectedCode: httpStatus.BAD_REQUEST,
      description: '>40 symbols'
    },
    {
      data: {
        fullname: 'a'
      },
      expectedCode: httpStatus.BAD_REQUEST,
      description: '<2 symbols'
    },
    {
      data: {
        fullname: 'Tony Stark'
      },
      expectedCode: httpStatus.OK,
      description: 'valid'
    }
  ],
  'contacts.email': [
    {
      data: {
        contacts: {
          email: null
        }
      },
      expectedCode: httpStatus.BAD_REQUEST,
      description: 'empty'
    },
    {
      data: {
        contacts: {
          email: 'not-a-email'
        }
      },
      expectedCode: httpStatus.BAD_REQUEST,
      description: 'not an email'
    },
    {
      data: {
        contacts: {
          email: 'valid.mail@gmail.com'
        }
      },
      expectedCode: httpStatus.OK,
      description: 'valid'
    }
  ],
  position: [
    {
      data: {
        position: 'CTO'
      },
      expectedCode: httpStatus.OK,
      description: 'valid'
    },
    {
      data: {
        position: 'a'
      },
      expectedCode: httpStatus.BAD_REQUEST,
      description: '<2 symbols'
    },
    {
      data: {
        position: Array.from({ length: 20 }).join('')
      },
      expectedCode: httpStatus.BAD_REQUEST,
      description: '>20 symbols'
    },
    {
      data: {
        position: null
      },
      expectedCode: httpStatus.BAD_REQUEST,
      description: 'empty'
    }
  ],
  salary: [
    {
      data: {
        salary: 30000
      },
      expectedCode: httpStatus.OK,
      description: 'valid'
    },
    {
      data: {
        salary: null
      },
      expectedCode: httpStatus.BAD_REQUEST,
      description: 'empty'
    },
    {
      data: {
        salary: -2
      },
      expectedCode: httpStatus.BAD_REQUEST,
      description: '< 0'
    },
    {
      data: {
        salary: 'aaa'
      },
      expectedCode: httpStatus.BAD_REQUEST,
      description: 'not a number'
    }
  ]
};
const defaultTestsForQueries = [
  {
    query: {},
    expectedCode: httpStatus.OK
  },
  {
    query: {
      skip: 2
    },
    expectedCode: httpStatus.OK
  },
  {
    query: {
      skip: -3
    },
    expectedCode: httpStatus.BAD_REQUEST
  },
  {
    query: {
      skip: 100
    },
    expectedCode: httpStatus.OK
  },
  {
    query: {
      skip: 'not-a-number'
    },
    expectedCode: httpStatus.BAD_REQUEST
  },
  {
    query: {
      limit: 2
    },
    expectedCode: httpStatus.OK
  },
  {
    query: {
      limit: -2
    },
    expectedCode: httpStatus.BAD_REQUEST
  },
  {
    query: {
      limit: 'not-a-number'
    },
    expectedCode: httpStatus.BAD_REQUEST
  },
  {
    query: {
      limit: 0
    },
    expectedCode: httpStatus.BAD_REQUEST
  },
  {
    query: {
      limit: 200
    },
    expectedCode: httpStatus.BAD_REQUEST
  },
  {
    query: {
      skip: 0,
      limit: 2
    },
    expectedCode: httpStatus.OK
  },
  {
    query: {
      skip: -1,
      limit: 50
    },
    expectedCode: httpStatus.BAD_REQUEST
  },
  {
    query: {
      skip: 0,
      limit: -2
    },
    expectedCode: httpStatus.BAD_REQUEST
  },
  {
    query: {
      skip: -3,
      limit: 0
    },
    expectedCode: httpStatus.BAD_REQUEST
  }
];

module.exports = {
  defaultTestsForQueries,
  testSuitsForWorker,
  testSuitsForUser,
  testSuitsForUserPassword
};
