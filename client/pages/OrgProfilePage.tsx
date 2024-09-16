import { useNavigate, useParams } from 'react-router-dom'
import { useOrganisationsById } from '../hooks/useOrganisations'
import CurrentlyAccepting from '../components/ProfileCurrentlyAccepting'
import { useTypesById } from '../hooks/useTypes'
import ProfileAbout from '../components/ProfileAbout'
import ProfileCard from '../components/ProfileCard'
import VolunteersNeeded from '../components/VolunteersNeeded'
import ProfileHowToDonate from '../components/ProfileHowToDonate'
import ProfileMap from '../components/ProfileMap'
import { useUsers } from '../hooks/useUsers'
import { User } from '@auth0/auth0-react'
import { useState } from 'react'

export const sleep = (ms: number) =>
  new Promise((resolve) => setTimeout(resolve, ms))

export default function OrgProfilePage() {
  const param = useParams()
  const navigate = useNavigate()
  const [hideMap, setHideMap] = useState(false)
  const id = Number(param.id)
  const { data, isPending, isError, error, failureCount } =
    useOrganisationsById(id)
  const typeData = useTypesById(id)
  const user = useUsers()

  if (isPending || !data) {
    let failures = ''
    if (failureCount > 0) {
      failures = ` (failed ${failureCount} times)`
    }
    if (failureCount > 3) {
      navigate('/')
    }
    return <div>Loading... {failures}</div>
  }

  if (isError) {
    return <p>Failed to get Org: {error.message}</p>
  }

  if (typeData.isPending || !typeData.data) {
    let failures = ''
    if (typeData.failureCount > 0) {
      failures = ` (failed ${typeData.failureCount} times)`
    }
    if (typeData.failureCount > 3) {
      navigate('/')
    }
    return <div>Loading... {failures}</div>
  }

  if (typeData.isError) {
    return <p>Failed to get Org: {typeData.error.message}</p>
  }

  const userCheck = user.data as User

  const handleEdit = async () => {
    setHideMap(true)

    await sleep(100)
    navigate(`/org/edit/${id}`)
  }

  console.log({ lat: data.latitude, lng: data.longitude })

  return (
    <div className="mx-auto grid max-w-7xl grid-cols-1 gap-4 px-1 py-10 sm:py-10 md:grid-cols-3 lg:ml-20 lg:mt-0 lg:grid-cols-4 lg:px-1">
      <section className=" col-span-1 md:col-span-1 lg:col-span-1">
        <ProfileCard
          image={data.image}
          name={data.name}
          contactEmail={data.contactEmail || ''}
          contactNumber={data.contactNumber || ''}
          location={data.location}
          orgType={data.orgTypes}
        />
      </section>
      <section className="col-span-1 flex flex-col gap-4 md:col-span-1 lg:col-span-2">
        <ProfileAbout about={data.about} />
        <CurrentlyAccepting typeData={typeData.data} />
        <VolunteersNeeded id={id} />
      </section>
      <section className="flex hidden flex-col gap-4 pb-1 md:block lg:col-span-1">
        <div className="block md:hidden">
          <ProfileHowToDonate method={data.donationMethod || ''} />
          {!hideMap && (
            <ProfileMap
              initial={{
                lat: data.latitude || -41.28869,
                lng: data.longitude || 174.7772,
              }}
            />
          )}
        </div>
        <div className="mt-4">
          <section className="hidden md:block">
            <ProfileHowToDonate method={data.donationMethod || ''} />
            {!hideMap && (
              <ProfileMap
                initial={{
                  lat: data.latitude || -41.28869,
                  lng: data.longitude || 174.7772,
                }}
              />
            )}
          </section>
        </div>
      </section>

      {userCheck?.orgId === id && (
        <button
          onClick={handleEdit}
          style={{
            backgroundColor: '#007bff',
            color: '#ffffff',
            border: '1px solid #0056b3',
            padding: '8px 16px',
            borderRadius: '4px',
            transition: 'background-color 0.3s ease, transform 0.2s ease',
          }}
          className="hover:bg-blue-800 focus:ring-blue-300 focus:outline-none focus:ring-2 active:scale-95"
        >
          Edit
        </button>
      )}
    </div>
  )
}
