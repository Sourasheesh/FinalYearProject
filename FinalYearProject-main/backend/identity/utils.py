from .models import IdentityMismatch


FIELDS_TO_COMPARE = [
    "full_name",
    "father_name",
    "mother_name",
    "date_of_birth",
    "gender",
]


def detect_identity_mismatch(identity, existing_identities):

    mismatches = []

    for existing in existing_identities:

        for field in FIELDS_TO_COMPARE:

            old_value = getattr(existing, field)
            new_value = getattr(identity, field)

            if old_value != new_value:

                mismatches.append(
                    IdentityMismatch.objects.create(
                        user=identity.user,
                        identity=identity,
                        field_name=field,
                        previous_value=old_value,
                        new_value=new_value
                    )
                )

                identity.verification_status = "MISMATCH"
                identity.save()

    return mismatches

def build_unified_identity(user, identities):

    priority = ["AADHAAR", "PASSPORT", "PAN", "VOTER_ID", "DRIVING_LICENSE"]

    verified_identities = [
        identity for identity in identities
        if identity.verification_status == "VERIFIED"
    ]

    primary_identity = None

    if verified_identities:
        verified_identities.sort(
            key=lambda x: priority.index(x.identity_type)
            if x.identity_type in priority else 999
        )
        primary_identity = verified_identities[0]

    linked_identities = []

    for identity in identities:
        linked_identities.append({
            "type": identity.identity_type,
            "identity_number": identity.identity_number,
            "verification_status": identity.verification_status
        })

    profile = {}

    if primary_identity:
        profile = {
            "name": primary_identity.full_name,
            "gender": primary_identity.gender,
            "date_of_birth": primary_identity.date_of_birth,
            "nationality": primary_identity.nationality
        }

    return primary_identity, linked_identities, profile