import { Link } from 'react-router-dom'
import {
  ArrowLeft,
  User,
  Mail,
  Phone,
  Building,
  Briefcase,
  MapPin,
  Calendar,
  Ruler,
  Scale,
  GraduationCap,
  VenusAndMars,
  Eye,
  HeartPulse,
  Scissors,
  type LucideIcon,
} from 'lucide-react'

import { useAppSelector } from '@/app/hooks'
import { selectAuth } from '@/features/auth/authSlice'
import { useGetMeQuery } from '@/features/auth/authApi'

import { PageHeading } from '@/components/PageHeading'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion'

type ProfileField = {
  label: string
  value?: React.ReactNode
  icon: LucideIcon
  capitalize?: boolean
}

type ProfileSection = {
  id: string
  title: string
  icon: LucideIcon
  fields: ProfileField[]
}

function hasValue(value: React.ReactNode) {
  return value !== undefined && value !== null && value !== ''
}

function ProfileRow({ label, value, icon: Icon, capitalize }: ProfileField) {
  if (!hasValue(value)) return null

  return (
    <div className="flex items-center justify-between gap-4 border-b px-4 py-3 last:border-b-0">
      <div className="flex min-w-0 items-center gap-3 text-sm text-muted-foreground">
        <Icon className="h-4 w-4 shrink-0 text-primary" />
        <span>{label}</span>
      </div>

      <span
        className={`text-right text-sm font-medium ${
          capitalize ? 'capitalize' : ''
        }`}
      >
        {value}
      </span>
    </div>
  )
}

function ProfileAccordion({ section }: { section: ProfileSection }) {
  const SectionIcon = section.icon

  const visibleFields = section.fields.filter(({ value }) => hasValue(value))

  if (!visibleFields.length) return null

  return (
    <AccordionItem
      value={section.id}
      className="overflow-hidden rounded-xl border bg-card shadow-sm"
    >
      <AccordionTrigger className="px-5 py-4 hover:no-underline">
        <div className="flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary/10 text-primary">
            <SectionIcon className="h-5 w-5" />
          </div>

          <div className="text-left">
            <p className="font-semibold">{section.title}</p>

            <p className="text-xs text-muted-foreground">
              {visibleFields.length}{' '}
              {visibleFields.length === 1 ? 'detail' : 'details'}
            </p>
          </div>
        </div>
      </AccordionTrigger>

      <AccordionContent className="pb-0">
        <div className="border-t">
          {visibleFields.map((field) => (
            <ProfileRow key={field.label} {...field} />
          ))}
        </div>
      </AccordionContent>
    </AccordionItem>
  )
}

function LoadingProfile() {
  return (
    <div className="flex flex-col items-center justify-center py-12 text-center">
      <p className="animate-pulse text-sm text-muted-foreground">
        Loading user profile details...
      </p>
    </div>
  )
}

function EmptyProfile() {
  return (
    <div className="flex flex-col items-center justify-center py-12 text-center">
      <p className="text-muted-foreground">No user profile data available.</p>

      <Link
        to="/"
        className="mt-4 text-sm font-medium text-primary hover:underline"
      >
        Return to Dashboard
      </Link>
    </div>
  )
}

export default function UserProfilePage() {
  const { user, accessToken } = useAppSelector(selectAuth)

  const {
    data: me,
    isLoading,
    isFetching,
    isError,
  } = useGetMeQuery(undefined, {
    skip: !accessToken,
  })

  // Prefer the complete /auth/me response.
  const profileUser = me ?? user

  if (isLoading && !profileUser) {
    return <LoadingProfile />
  }

  if (!profileUser) {
    return <EmptyProfile />
  }

  const {
    firstName,
    lastName,
    username,
    email,
    image,
    gender,
    phone,
    role,
    age,
    birthDate,
    company,
    address,
    university,
    height,
    weight,
    bloodGroup,
    eyeColor,
    hair,
  } = profileUser

  const fullName = [firstName, lastName].filter(Boolean).join(' ')

  const initials = [firstName, lastName]
    .map((name) => name?.[0])
    .filter(Boolean)
    .join('')
    .toUpperCase()

  const sections: ProfileSection[] = [
    {
      id: 'personal',
      title: 'Personal Information',
      icon: User,
      fields: [
        {
          label: 'Full Name',
          value: fullName,
          icon: User,
        },
        {
          label: 'Username',
          value: username ? `@${username}` : undefined,
          icon: User,
        },
        {
          label: 'Email Address',
          value: email,
          icon: Mail,
        },
        {
          label: 'Phone',
          value: phone,
          icon: Phone,
        },
        {
          label: 'Gender',
          value: gender,
          icon: VenusAndMars,
          capitalize: true,
        },
        {
          label: 'Age',
          value: age,
          icon: Calendar,
        },
        {
          label: 'Birth Date',
          value: birthDate,
          icon: Calendar,
        },
        {
          label: 'Role',
          value: role,
          icon: Briefcase,
          capitalize: true,
        },
      ],
    },

    {
      id: 'work',
      title: 'Work & Education',
      icon: Briefcase,
      fields: [
        {
          label: 'Company',
          value: company?.name,
          icon: Building,
        },
        {
          label: 'Department',
          value: company?.department,
          icon: Building,
        },
        {
          label: 'Job Title',
          value: company?.title,
          icon: Briefcase,
        },
        {
          label: 'University',
          value: university,
          icon: GraduationCap,
        },
      ],
    },

    {
      id: 'location',
      title: 'Location',
      icon: MapPin,
      fields: [
        {
          label: 'Address',
          value: address?.address,
          icon: MapPin,
        },
        {
          label: 'City',
          value: address?.city,
          icon: MapPin,
        },
        {
          label: 'State',
          value: address?.state,
          icon: MapPin,
        },
        {
          label: 'Country',
          value: address?.country,
          icon: MapPin,
        },
      ],
    },

    {
      id: 'physical',
      title: 'Physical Information',
      icon: HeartPulse,
      fields: [
        {
          label: 'Height',
          value: height !== undefined ? `${height} cm` : undefined,
          icon: Ruler,
        },
        {
          label: 'Weight',
          value: weight !== undefined ? `${weight} kg` : undefined,
          icon: Scale,
        },
        {
          label: 'Blood Group',
          value: bloodGroup,
          icon: HeartPulse,
        },
        {
          label: 'Eye Color',
          value: eyeColor,
          icon: Eye,
          capitalize: true,
        },
        {
          label: 'Hair',
          value: hair
            ? [hair.color, hair.type].filter(Boolean).join(' • ')
            : undefined,
          icon: Scissors,
          capitalize: true,
        },
      ],
    },
  ]

  return (
    <div className="mx-auto max-w-4xl space-y-6">
      {/* Navigation */}
      <Link
        to="/"
        className="inline-flex items-center gap-2 text-sm text-muted-foreground transition-colors hover:text-foreground"
      >
        <ArrowLeft className="h-4 w-4" />
        Back to stock console
      </Link>

      {/* Profile Header */}
      <section className="overflow-hidden rounded-xl border border-border bg-card p-6 shadow-sm">
        <div className="flex flex-col items-center gap-6 sm:flex-row sm:items-start">
          <Avatar className="h-24 w-24 border-2 border-primary/20 shadow-inner">
            <AvatarImage src={image} alt={fullName || username} />

            <AvatarFallback className="bg-primary/10 text-xl font-bold text-primary">
              {initials || <User className="h-8 w-8" />}
            </AvatarFallback>
          </Avatar>

          <div className="flex-1 space-y-1 text-center sm:text-left">
            <div className="flex flex-col items-center gap-2 sm:flex-row sm:justify-between">
              <PageHeading>{fullName || username}</PageHeading>

              {gender && (
                <Badge variant="secondary" className="capitalize">
                  {gender}
                </Badge>
              )}
            </div>

            <p className="text-sm text-muted-foreground">@{username}</p>

            <p className="pt-1 text-xs text-muted-foreground">
              User ID:{' '}
              <code className="rounded bg-muted px-1.5 py-0.5">
                {profileUser.id}
              </code>
            </p>

            {isFetching && (
              <p className="animate-pulse pt-2 text-xs text-muted-foreground">
                Updating profile...
              </p>
            )}

            {isError && (
              <p className="pt-2 text-xs text-amber-600">
                Unable to refresh profile details. Showing saved information.
              </p>
            )}
          </div>
        </div>
      </section>

      {/* Profile Sections */}
      <Accordion
        type="multiple"
        defaultValue={['personal']}
        className="space-y-3"
      >
        {sections.map((section) => (
          <ProfileAccordion key={section.id} section={section} />
        ))}
      </Accordion>
    </div>
  )
}
